package br.com.licursi.core.miner;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import br.com.licursi.core.process.ActivityEntity;
import br.com.licursi.core.process.ActivitySimpleEntity;
import br.com.licursi.core.process.ActivityType;
import br.com.licursi.core.process.ArcEntity;
import br.com.licursi.core.process.BorderEventEntity;
import br.com.licursi.core.process.BorderEventType;
import br.com.licursi.core.process.ProcessEntity;
import br.com.licursi.core.process.TupleEntity;

import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;

public class DependencyGraph {
	
	private SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy hh:mm");
	
	// Character used to compute the next Char alias for Activity
	private char aliasCharActivity = 64; // 'A'
	private int aliasKeyEvents = 0;
	
	private BiMap<String, Character> activityAlias = null;
	private Map<String, ActivityEntity> activityMap = null;
	private Map<String, BorderEventEntity> borderEventMap = null;
	
	private Map<String, ArcEntity> arcsMap = null;
	private Map<String, List<ArcEntity>> arcsEndedWith = null;
	
	private Map<String, Integer> tupleOcurrency = null;
	private Map<String, TupleEntity> tuplesMap = null;
	

	private ActivityEntity lastActivity = null;
	private TupleEntity currentTuple = null;
	private long lastActivityEndTime = 0L;
	private int caseIndex = 1;
	private String textTuple = "";

	public DependencyGraph(){
		this.activityAlias = HashBiMap.create();
		this.arcsMap = new HashMap<String, ArcEntity>();
		this.tupleOcurrency = new HashMap<String, Integer>();
		this.activityMap = new HashMap<String, ActivityEntity>();
		this.borderEventMap = new HashMap<String, BorderEventEntity>();
		this.tuplesMap = new HashMap<String, TupleEntity>();
	}

	public void start(){
		this.lastActivity = null;
		this.currentTuple = new TupleEntity();
		this.textTuple = "";
		this.lastActivityEndTime = 0L;
	}
	
	/////////////////////// ACTIVITIES

	/**
	 * Put the activity and it's resource to process and compute in activityList 
	 * @param activity As the name says
	 * @param resource As the name says
	 */
	public void put(Object activity, Object time, Object resource) {
		if (activity != null){
			
			// Converts data if possible
			Date newTime = null;
			if (time != null){
				try {
					newTime = dateFormat.parse(time.toString());
				} catch (ParseException e) {
					e.printStackTrace();
				}
			}
			
			put(activity.toString(), newTime.getTime(), (resource != null ? resource.toString() : "!NONE!"));
		}
	}
	
	/**
	 * Put the activity and it's resource to process and compute in activityList 
	 * @param activity As the name says
	 * @param endTime Activity end time
	 * @param resource As the name says
	 */
	private void put(String activity, long endTime, String resource) {
		activity = activity.toUpperCase();
		Character activityChar = getActivityAlias(activity);
		ActivityEntity activityEntity = activityMap.get(activityChar + "");
		
		// Creates activity if not found
		if (activityEntity == null){
			activityEntity = new ActivityEntity(activity, activityChar.toString());
			activityMap.put(activityChar+"", activityEntity);
		}
		
		lastActivityEndTime = endTime;
		currentTuple.putActivity(activityChar, activity, endTime, resource);
		
		if (lastActivity != null){
			appendArc(lastActivity.getUniqueLetter() + ArcEntity.SPLIT_CHAR + activityChar);

			// Updates previous Activity dependences
			activityEntity.addPrev(lastActivity.getName());
			// Updates last Activity dependences
			lastActivity.addNext(activity);
			
		} else {
			appendEventBorder(activityEntity, BorderEventType.START);
			currentTuple.setStart(endTime);
		} 
		
		lastActivity = activityEntity;
		textTuple += activityChar;
	}

	public String end(){
		appendEventBorder(this.lastActivity, BorderEventType.END);
		appendTuple(this.textTuple);
		
		this.currentTuple.setName(this.textTuple);
		this.currentTuple.setEnd(this.lastActivityEndTime);
		
		this.tuplesMap.put("case " + this.caseIndex, this.currentTuple);
		this.caseIndex++;
		
		return textTuple;
	}

	/**
	 * Loads the processed activities to a List
	 * @return List of activites
	 */
	public Map<String, ActivityEntity> getActivities(){
		
		Map<String, ActivityEntity> nameActivity = new HashMap<String, ActivityEntity>();
		for (ActivityEntity act : activityMap.values()){
			act.computeAverageTime();
			nameActivity.put(act.getName(), act);
		}
		return nameActivity;
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
			arcEntity.increment();
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
			arcEntity.increment();
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
	
	public ProcessEntity getProcessedData(String id){
		long startProcessing = System.currentTimeMillis();
		
		long computeParalellism = computeParalellism();
		long computeDependencyMeasure = computeDependencyMeasure();
		long computeArcsTimes = computeArcsTimes();
		
		ProcessEntity processEntity = new ProcessEntity(id);
		
		processEntity.setBorderEvents(this.getBorderEvents());
		processEntity.setActivities(this.getActivities());
		processEntity.setArcs(this.getArcs());
		processEntity.setTuples(this.tuplesMap);
		
		long endProcessing = System.currentTimeMillis();
		long totalProcessing = (endProcessing - startProcessing);
		System.out.println("=============================================");
		System.out.println("= Tempo processando :                       ");
		System.out.println("= Paralelismo.......: "+ computeParalellism + " ms (" + (Math.floor((computeParalellism/totalProcessing)*10000)/100) + " %)");
		System.out.println("= Dependencia.......: "+ computeDependencyMeasure + " ms (" + (Math.floor((computeDependencyMeasure/totalProcessing)*10000)/100) + " %)");
		System.out.println("= Tempo dos arcos...: "+ computeArcsTimes + " ms (" + (Math.floor((computeArcsTimes/totalProcessing)*10000)/100) + " %)");
		System.out.println("= ");
		System.out.println("= Total.......: "+ totalProcessing + " ms (" + (Math.floor((computeParalellism/totalProcessing)*10000)/100) + " %)");
		
		return processEntity;
	}

	
	
	private long computeArcsTimes() {
		long startTime = System.currentTimeMillis();
		
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
		
		for (String key : tuplesMap.keySet()){
			TupleEntity tupleEntity = tuplesMap.get(key);
			
			// Recover the list of activities, avoiding the first one, 
			// for the purpouse of calculating of arcs time
			for (int i = 1 ; i < tupleEntity.getActivities().size(); i++){
				ActivitySimpleEntity activitySimple = tupleEntity.getActivities().get(i);
				List<ArcEntity> possibleArcs = getPossibleArcs(activitySimple.getUniqueLetter());
				
				for (ArcEntity arc : possibleArcs){
					ActivitySimpleEntity activity = getValidaArcStartActivity(arc, i, tupleEntity.getActivities()); 
					if (activity != null){
						tupleEntity.putArc(arc.getRef(), activity.getEndTime(), activitySimple.getEndTime(), activitySimple.getResource(), 0f);
					}
				}
			}
			
		}
		long endTime = System.currentTimeMillis();
		
		return (endTime - startTime);
		
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
	//	
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
