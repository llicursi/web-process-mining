package br.com.licursi.core.miner;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import br.com.licursi.core.miner.exceptions.InvalidDateException;
import br.com.licursi.core.miner.exceptions.ParseTimeException;
import br.com.licursi.core.process.ProcessAndCases;
import br.com.licursi.core.process.ProcessDetailsEntity;
import br.com.licursi.core.process.ProcessMongoEntity;
import br.com.licursi.core.process.activities.ActivityEntity;
import br.com.licursi.core.process.activities.ActivitySimpleEntity;
import br.com.licursi.core.process.activities.ActivityType;
import br.com.licursi.core.process.arcs.ArcEntity;
import br.com.licursi.core.process.cases.CaseEntity;
import br.com.licursi.core.process.cases.CaseMongoEntity;
import br.com.licursi.core.process.events.BorderEventEntity;
import br.com.licursi.core.process.events.BorderEventType;
import br.com.licursi.core.util.GenericUtil;

import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;

public class DependencyGraph {
	
	private DateTimeFormatter dateFormat = null;
	
	// Character used to compute the next Char alias for Activity
	private char aliasCharActivity = 64; // 'A'
	private int aliasKeyEvents = 0;
	
	private BiMap<String, Character> activityAlias = null;
	private Map<String, ActivityEntity> activityMap = null;
	private Map<String, BorderEventEntity> borderEventMap = null;
	
	private Map<String, ArcEntity> arcsMap = null;
	private Map<String, List<ArcEntity>> arcsEndedWith = null;
	
	private Map<String, Integer> tupleOcurrency = null;
	private Map<String, CaseEntity> caseMap = null;
	

	private ActivityEntity lastActivity = null;
	private CaseEntity currentCase = null;
	private long lastActivityEndTime = 0L;
	private long firstActivityEndTime = 0L;
	private long caseTimeCounter = 0L;
	private String textTuple = "";

	public DependencyGraph(){
		this.activityAlias = HashBiMap.create();
		this.arcsMap = new HashMap<String, ArcEntity>();
		this.tupleOcurrency = new HashMap<String, Integer>();
		this.activityMap = new HashMap<String, ActivityEntity>();
		this.borderEventMap = new HashMap<String, BorderEventEntity>();
		this.caseMap = new HashMap<String, CaseEntity>();
	}

	public void start(String caseId){
		start();
		this.currentCase.setCaseId(caseId);
	}
	
	public void start(){
		this.lastActivity = null;
		this.currentCase = new CaseEntity();
		this.textTuple = "";
		this.lastActivityEndTime = 0L;
		this.firstActivityEndTime = 0L;
		
	}
	
	/////////////////////// ACTIVITIES
	
	private Long parseDate(String dateTime) throws ParseTimeException{
		
		if (this.dateFormat != null){
			try{
				return dateFormat.parseDateTime(dateTime).getMillis();
			} catch (IllegalArgumentException e) {
				throw new ParseTimeException(e);
			}
		} else {
			// If no parser is found, then register the last one to avoid the rework of this code snippet  
			String[] possibles = {"YYYY-MM-dd HH:mm:ss.SSS", "dd-MM-YYYY HH:mm", "dd-MM-YYYY hh:mm:ss.SSS", "dd-MM-YYYY HH:mm:ss"};
			
			// Last ParseException
			ParseTimeException p = null;
			
			for (String possibleParser : possibles){
				try {
					DateTimeFormatter formattter = DateTimeFormat.forPattern(possibleParser);
					long parseMillis = formattter.parseMillis(dateTime);
					this.dateFormat = formattter;
					return parseMillis;
					
				} catch (IllegalArgumentException e) {
					p = new ParseTimeException(e);
				}
			}
			// Throws the last error only
			throw p;
		}
	}

	/**
	 * Put the activity and it's resource to process and compute in activityList 
	 * @param activity As the name says
	 * @param resource As the name says
	 * @throws InvalidDateException when any data passed is invalid
	 */
	public void put(Object caseId, Object activity, Object time, Object resource) throws InvalidDateException {
		if (activity != null){
			
			// Converts data if possible
			Long endTime = null;
			if (time != null){
				try {
					endTime = parseDate(time.toString());
				} catch (ParseTimeException e) {
					String message = "The current process, \"" + caseId.toString() + "\" at " + this.textTuple +", was interrupted due date time conversion error";
					throw new InvalidDateException(message);
				}
				
			}
			
			put(activity.toString(), endTime, GenericUtil.formatToValidMongoKey((resource != null ? resource.toString() : "NONE"), ""));
		}
	}
	

	/**
	 * Put the activity and it's resource to process and compute in activityList 
	 * @param activityName As the name says
	 * @param endTime Activity end time
	 * @param resource As the name says
	 */
	private void put(String activityName, long endTime, String resource) {
		activityName = activityName.toUpperCase();
		Character activityChar = getActivityAlias(activityName);
		ActivityEntity activityEntity = getActivity(activityChar + "", activityName);
				
		lastActivityEndTime = endTime;
		currentCase.putActivity(activityChar, activityName, endTime, resource);
		
		if (lastActivity != null){
			appendArc(lastActivity.getUniqueLetter() + ArcEntity.SPLIT_CHAR + activityChar);

			// Updates previous Activity dependences
			activityEntity.addPrev(lastActivity.getName());
			// Updates last Activity dependences
			lastActivity.addNext(activityName);
			
		} else {
			this.firstActivityEndTime = endTime;
			appendEventBorder(activityEntity, BorderEventType.START);
			currentCase.setStart(endTime);
		} 
		
		lastActivity = activityEntity;
		textTuple += activityChar;
	}

	public String end(String caseId){
		appendEventBorder(this.lastActivity, BorderEventType.END);
		appendTuple(this.textTuple);
		
		this.currentCase.setCaseId("a" + caseId);
		this.currentCase.setTuple(this.textTuple);
		this.currentCase.setEnd(this.lastActivityEndTime);
		
		Long caseTotalTime = (this.lastActivityEndTime - this.firstActivityEndTime);
		this.caseTimeCounter += caseTotalTime;
		
		this.caseMap.put(this.currentCase.getCaseId(), this.currentCase);
		
		return textTuple;
	}

	
	/**
	 * Gets an existing activity in the pool, if does not exist, creates a new one.
	 * @param activityChar Character that represents the activity
	 * @param activityName Activity name
	 * @return Activity
	 */
	private ActivityEntity getActivity(String activityChar, String activityName) {
		ActivityEntity activityEntity = activityMap.get(activityChar);
		
		// Creates activity if not found
		if (activityEntity == null){
			activityEntity = new ActivityEntity(activityName, activityChar.toString());
			activityMap.put(activityChar, activityEntity);
		}
		// TODO: reverter aqui
		//activityEntity.incrementCounter();
		
		return activityEntity;
	}
	
	/**
	 * Loads the processed activities to a List
	 * @return List of activites
	 */
	public Map<String, ActivityEntity> getActivities(){
		
		Map<String, ActivityEntity> mapActivity = new HashMap<String, ActivityEntity>();
		for (ActivityEntity act : activityMap.values()){
			act.computeAverageTime();
			mapActivity.put(act.getName(), act);
		}
		return mapActivity;
	}

	/**
	 * Recovers the current char representing the activity, if it does not exists, gets the 
	 * next available character from the alphabetic. <b>Case-sensitive</b> 
	 * @param activity String representing the activity
	 * @return Character representing the existing activity
	 */
	private Character getActivityAlias(String activity){

		activity = padronizeActivity(activity);

		if (activityAlias.containsKey(activity)){
			return activityAlias.get(activity);
		}

		activityAlias.put(activity, ++aliasCharActivity);
		if (aliasCharActivity == 91){ 	// Change from '[' to 'a'
			aliasCharActivity+=6; 		// Jump 6 char 
		}

		return aliasCharActivity;
	}

	private String padronizeActivity(String activity){
		return activity.trim().toUpperCase();
	}
	
	/////////////////////// EVENT BORDERS
	/**
	 * Loads the processed border events
	 * @return Map of border events
	 */
	public Map<String, BorderEventEntity> getBorderEvents(){
		return borderEventMap;
	}


	private void appendEventBorder(ActivityEntity activityEntity, BorderEventType type){

		if (activityEntity.getType() == ActivityType.NORMAL){
			String name = type.name() + aliasKeyEvents;
			String boderEventKey = getBoderEventKey();
			BorderEventEntity borderEventEntity = new BorderEventEntity(name, boderEventKey);
			borderEventEntity.setType(type);
			borderEventMap.put(name, borderEventEntity);
	
			String arcRef = null;
			ArcEntity arcEntity = null;
	
			if (type == BorderEventType.START){
				arcRef = boderEventKey + ArcEntity.SPLIT_CHAR + activityEntity.getUniqueLetter();
				
				arcEntity = new ArcEntity(arcRef, name, activityEntity.getName());
				activityEntity.setType(ActivityType.START);
				activityEntity.addPrev(name);
				borderEventEntity.addNext(activityEntity.getName());
	
			} else {
				arcRef = activityEntity.getUniqueLetter() + ArcEntity.SPLIT_CHAR + boderEventKey ;
				
				arcEntity = new ArcEntity(arcRef, activityEntity.getName(), name);
				activityEntity.setType(ActivityType.END);
				activityEntity.addNext(name);
				borderEventEntity.addPrev(activityEntity.getName());
	
			}
			arcsMap.put(arcRef, arcEntity);
		}
	}

	private String getBoderEventKey(){
		int borderKey = aliasKeyEvents ++;
		return (borderKey > 9 ? "" : "0") + borderKey;
	}
	
	/////////////////////// ARC

	private void appendArc(String arc){
		if (arc != null && arc.length() == 3){
			ArcEntity arcEntity = arcsMap.get(arc);
			if (arcEntity == null){
				arcEntity = new ArcEntity(arc);
				
				// Gets the from and to activity name;
				BiMap<Character, String> inverse = activityAlias.inverse();
				
				String[] splitArc = arc.split(ArcEntity.SPLIT_CHAR);
				
				Character fromChar = splitArc[0].charAt(0);
				String from = inverse.get(fromChar).toString();
				arcEntity.setSource(from);
				Character toChar = splitArc[1].charAt(0);
				String to = inverse.get(toChar).toString();
				arcEntity.setTarget(to);

			}
			arcsMap.put(arc, arcEntity);
		}
	}


	public Map<String, ArcEntity> getArcs() {
		return arcsMap;
	}
	
	
	/////////////////////// TUPLES

	private void appendTuple(String tuple){

		Integer value = tupleOcurrency.get(tuple);
		if (value == null){
			value = 0;
		}
		value++;
		tupleOcurrency.put(tuple, value);
	}
	
	/////////////////////// Tables
	
	public void printRelationalTable(){
		
		// Line 1
		String line1 = "  |";
		Set<Character> activitySetChars = activityAlias.values();
		List<Character> activityChars = new ArrayList<Character>();
		activityChars.addAll(activitySetChars);
		Collections.sort(activityChars);

		for (Character c : activityChars){
			line1 += " " + c + "  |";
		}
		System.out.println("" + line1);
		
		// Other lines
		String middleLines = "";
		for (Character c1 : activityChars){
			middleLines = c1 + " |";
			for (Character c2 : activityChars){
				middleLines += " " + activityRelation(c1, c2) + " |";  
			}
			System.out.println(middleLines);
		}
		
	}
	
	private String activityRelation(Character c1, Character c2){
		return arcsMap.containsKey(c1 + ArcEntity.SPLIT_CHAR + c2) ? ">>" : "  "; 
	}
	
	public void printOcurrancyTable(){
		
		// Line 1
		String line1 = "  |";
		Set<Character> activitySetChars = activityAlias.values();
		List<Character> activityChars = new ArrayList<Character>();
		activityChars.addAll(activitySetChars);
		Collections.sort(activityChars);

		for (Character c : activityChars){
			line1 += " " + c + "  |";
		}
		System.out.println("" + line1);
		
		// Other lines
		String middleLines = "";
		for (Character c1 : activityChars){
			middleLines = c1 + " |";
			for (Character c2 : activityChars){
				ArcEntity arcEntity = arcsMap.get(c1 + ArcEntity.SPLIT_CHAR + c2);
				if (arcEntity != null){
					Integer count = arcEntity.getCount();
					middleLines += " " + count + (count > 9 ? "" : " ") + " |";
				} else{
					middleLines += "    |";
				} 
			}
			System.out.println(middleLines);
		}
		
	}
	
	public ProcessAndCases getProcessedData(String uuid){
		long startProcessing = System.currentTimeMillis();
		ProcessDetailsEntity processDetailEntity = getDetails();
		
		long lComputeParalellism = computeParalellism();
		long lComputeDependencyMeasure = computeDependencyMeasure();
		List<CaseMongoEntity> casesWithTimeProcessed = getCasesWithTimeProcessed(processDetailEntity.getAverageTime(), uuid);
		
		ProcessMongoEntity processEntity = new ProcessMongoEntity(uuid);
		
		processEntity.setBorderEvents(this.getBorderEvents());
		processEntity.setActivities(this.getActivities());
		processEntity.setArcs(this.getArcs());
		processEntity.setDetails(processDetailEntity);
		
		long endProcessing = System.currentTimeMillis();
		long totalProcessing = (endProcessing - startProcessing)+1;
		System.out.println("=============================================");
		System.out.println("= Tempo processando :                       ");
		System.out.println("= Paralelismo.......: "+ lComputeParalellism + " ms (" + (Math.floor((lComputeParalellism/totalProcessing)*10000)/100) + " %)");
		System.out.println("= Dependencia.......: "+ lComputeDependencyMeasure + " ms (" + (Math.floor((lComputeDependencyMeasure/totalProcessing)*10000)/100) + " %)");
		System.out.println("= ");
		System.out.println("= Total.......: "+ totalProcessing + " ms (" + (Math.floor((lComputeParalellism/totalProcessing)*10000)/100) + " %)");
		
		return new ProcessAndCases(processEntity, casesWithTimeProcessed);
		
	}
	
	public List<CaseMongoEntity> getCasesWithTimeProcessed(Long avgCaseTimes, String uuid){
		
		long startTime = System.currentTimeMillis();
		long avgCaseTimeOnePercent = (new Double(avgCaseTimes*0.01)).longValue(); 
		
		List<CaseMongoEntity> tuplesToAdd = new ArrayList<CaseMongoEntity>();
		
		CaseMongoEntity currentCasesMongoEntity = new CaseMongoEntity();
		List<Long> startTimes = new ArrayList<Long>();
		List<Long> endTimes = new ArrayList<Long>();
		
		Long accumulatedSize = 0L;
		
		buildListOfArcsEndedWithSomeLetter();
		
		for (String key : caseMap.keySet()){
			
			CaseEntity caseEntity = caseMap.get(key);
			
			// Compute the initial arc, from the symbol representing the start to the 
			Long startActivityTime = 0L;
			{
				ActivitySimpleEntity activitySimple = caseEntity.getActivities().get(0);
				List<ArcEntity> possibleArcs = getPossibleArcs(activitySimple.getUniqueLetter());
				for (ArcEntity arc : possibleArcs){
					if (arc.getSource().toUpperCase().contains("START")){
						startActivityTime = activitySimple.getEndTime() - avgCaseTimeOnePercent;
						long duration = avgCaseTimeOnePercent;
						this.activityMap.get(activitySimple.getUniqueLetter()).addResource(activitySimple.getResource(), duration);
						caseEntity.putArc(arc.getRef(),startActivityTime, activitySimple.getEndTime(), activitySimple.getResource(), 0f);
						arcsMap.get(arc.getRef()).addTime(avgCaseTimeOnePercent).increment();
						caseEntity.setStart(startActivityTime);
					}
				}
			}
		
			// Recover the list of activities, avoiding the first one, 
			// for the purpouse of calculating of arcs time
			for (int i = 1 ; i < caseEntity.getActivities().size(); i++){
				ActivitySimpleEntity activitySimple = caseEntity.getActivities().get(i);
				List<ArcEntity> possibleArcs = getPossibleArcs(activitySimple.getUniqueLetter());
				
				for (ArcEntity arc : possibleArcs){
					ActivitySimpleEntity activity = getValidaArcStartActivity(arc, i, caseEntity.getActivities()); 
					if (activity != null){
						long duration = activitySimple.getEndTime() - activity.getEndTime();
						this.activityMap.get(activitySimple.getUniqueLetter()).addResource(activitySimple.getResource(), duration);
						caseEntity.putArc(arc.getRef(), activity.getEndTime(), activitySimple.getEndTime(), activitySimple.getResource(), 0f);
						Long arcDuration = (activitySimple.getEndTime() -  activity.getEndTime());
						arcsMap.get(arc.getRef()).addTime(arcDuration);
						arc.increment();
					}
				}
			}
			
			// Compute the last Activity to the borderEvent, using 1% of average time. 
			Long endActivityTime = 0L;
			{
				ActivitySimpleEntity lastActivity = caseEntity.getActivities().get(caseEntity.getActivities().size()-1);
				for (BorderEventEntity border : borderEventMap.values()){
					if (border.getType().equals(BorderEventType.END.toString())){
						String ref = lastActivity.getUniqueLetter() + ">" + border.getRef();
						if (arcsMap.containsKey(ref)){
							endActivityTime = caseEntity.getEnd() + avgCaseTimeOnePercent;
							caseEntity.putArc(ref,lastActivity.getEndTime(), endActivityTime, "NONE", 0f);
							arcsMap.get(ref).addTime(avgCaseTimeOnePercent).increment();
							caseEntity.setEnd(endActivityTime);
							break;
						}
					}
				}
			}
		
			accumulatedSize += caseEntity.getSize();
			if (accumulatedSize > 15000000){
				
				currentCasesMongoEntity.setEndingTimes(endTimes);
				currentCasesMongoEntity.setStartingTimes(startTimes);
				currentCasesMongoEntity.setUuid(uuid);
				tuplesToAdd.add(currentCasesMongoEntity);
				
				// Restart
				currentCasesMongoEntity = new CaseMongoEntity();
				startTimes = new ArrayList<Long>();
				endTimes = new ArrayList<Long>();
				
				accumulatedSize = caseEntity.getSize();
			}
			
			currentCasesMongoEntity.putTuple(key, caseEntity);
			endTimes.add(endActivityTime);
			startTimes.add(startActivityTime);
						
		}
		
		currentCasesMongoEntity.setEndingTimes(endTimes);
		currentCasesMongoEntity.setStartingTimes(startTimes);
		currentCasesMongoEntity.setUuid(uuid);
		tuplesToAdd.add(currentCasesMongoEntity);
		
		long endTime = System.currentTimeMillis();
		System.out.println("= ");
		System.out.println("= Case Times..: " + (endTime - startTime) + " ms");
		System.out.println("=============================================");
		return tuplesToAdd;
		
	}
	
	
	private ProcessDetailsEntity getDetails() {
		
		Float avgTime = (this.caseTimeCounter/ (new Integer(this.caseMap.size())).floatValue());
		ProcessDetailsEntity procesDetail = new ProcessDetailsEntity();
		procesDetail.setAverageTime(avgTime.longValue());
		procesDetail.setTotalCases(this.caseMap.size());
		
		return procesDetail;
	}


	private void buildListOfArcsEndedWithSomeLetter() {
		arcsEndedWith = new HashMap<String, List<ArcEntity>>();
		for (ArcEntity arc : arcsMap.values()){
			 String uniqueLetter = activityAlias.get(arc.getTarget()) + "";
			 List<ArcEntity> list = arcsEndedWith.get(uniqueLetter);
			 if (list == null){
				 list = new ArrayList<ArcEntity>();
			 }
			 if (!list.contains(arc)){
				list.add(arc); 
			 }
			 arcsEndedWith.put(uniqueLetter, list);
		}
		
		
	}

	private ActivitySimpleEntity getValidaArcStartActivity(ArcEntity arc,int i, List<ActivitySimpleEntity> activities) {
		for (int f = i-1; f >= 0; f--){
			ActivitySimpleEntity activitySimpleEntity = activities.get(f);
			String source = activitySimpleEntity.getName();
			if (source != null && source.toUpperCase().equals(arc.getSource())){
				return activitySimpleEntity;
			}
		}
		return null;
	}

	private List<ArcEntity> getPossibleArcs(String activitiyUniqueLetter) {
		String uniqueLetter = activitiyUniqueLetter;
		return arcsEndedWith.get(uniqueLetter);
	}

	//============================================================= 
	// Paralelismo Simples com duas atividades paralelas
	//			 B
	//		   /   \
	//	... - A     D - ...
	//		   \   /
	//			 C
	//============================================================= 
	private long computeParalellism() {
		long startTime = System.currentTimeMillis();
		
		Set<Character> activitySetChars = activityAlias.values();
		BiMap<Character, String> inverse = activityAlias.inverse();
		List<Character> activityChars = new ArrayList<Character>();
		activityChars.addAll(activitySetChars);
		Collections.sort(activityChars);
		
		// find B->C C->B
		for (Character c1 : activityChars){
			for (Character c2 : activityChars){
				if (!c1.equals(c2)){
					
					if (arcsMap.containsKey(c1 + ArcEntity.SPLIT_CHAR+ c2) && arcsMap.containsKey(c2 + ArcEntity.SPLIT_CHAR+ c1)){
					
						// find A->B and A->C
						Character previous = getMutualPredecessor(c1, c2, activityChars);
						if (previous != null){
							// Find B->D  and C->D
							Character mutualSucessor = getMutualSucessor(c1, c2, activityChars);
							
							if (mutualSucessor != null){
								System.out.println("Simple paralellism found : ");
								System.out.println(" " + previous + " < " + c1 + " " + c2 + " > " + mutualSucessor +  "  " );
								String activtyC1 = inverse.get(c1);
								String activtyC2 = inverse.get(c2);
								activityMap.get(c1 + "").getNext().remove(activtyC2);
								activityMap.get(c2 + "").getNext().remove(activtyC1);
								activityMap.get(c1 + "").getPrevious().remove(activtyC2);
								activityMap.get(c2 + "").getPrevious().remove(activtyC1);
								
								// Remove Arcs
								arcsMap.remove(c1 + ArcEntity.SPLIT_CHAR + c2);
								arcsMap.remove(c2 + ArcEntity.SPLIT_CHAR + c1);
							}
							
						}
					}
				}
			}
		}
		long endTime = System.currentTimeMillis();
		return (endTime - startTime);
	}

	private Character getMutualPredecessor(Character c1, Character c2, List<Character> activityChars) {
		for (Character previous : activityChars){
			if (!previous.equals(c1) && !previous.equals(c2)){
				if (arcsMap.containsKey(previous + ArcEntity.SPLIT_CHAR + c1) && arcsMap.containsKey(previous + ArcEntity.SPLIT_CHAR + c2)){
					return previous;
				}
			}
		}
		return null;
	}

	private Character getMutualSucessor(Character c1, Character c2, List<Character> activityChars) {
		for (Character next : activityChars){
			if (!next.equals(c1) && !next.equals(c2)){
				if (arcsMap.containsKey(c1 + ArcEntity.SPLIT_CHAR + next) && arcsMap.containsKey(c2 + ArcEntity.SPLIT_CHAR + next)){
					return next;
				}
			}
		}
		return null;
	}
	
	//============================================================= 
	// Computa a medida de dependencia dos arcos
	//============================================================= 

	private long computeDependencyMeasure() {
		long startTime = System.currentTimeMillis();
		for (ArcEntity arc : arcsMap.values()){
			Integer inverseCount = getOppositeCount(arc); 
			float divisor = arc.getCount() - inverseCount;
			float dividendus = arc.getCount() + inverseCount + 1f;
			
			arc.setDependencyMeasure(dividendus != 0f ? divisor/dividendus : dividendus);
		}
		long endTime = System.currentTimeMillis();
		return (endTime - startTime);
	}

	private Integer getOppositeCount(ArcEntity arc) {
		String[] split = arc.getRef().split(ArcEntity.SPLIT_CHAR);
		String refReversed = split[1] + ArcEntity.SPLIT_CHAR + split[0];
		ArcEntity arcEntity = arcsMap.get(refReversed);
		if (arcEntity == null){
			return 0;
		}
		return arcEntity.getCount();
	}
	
	
	

}
