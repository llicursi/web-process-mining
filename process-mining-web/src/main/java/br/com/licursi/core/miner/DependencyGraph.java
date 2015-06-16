package br.com.licursi.core.miner;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.thymeleaf.util.StringUtils;

import br.com.licursi.core.process.ActivityEntity;
import br.com.licursi.core.process.ArcEntity;

import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;

public class DependencyGraph {
	
	private SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy hh:mm");
	
	// Character used to compute the next Char alias for Activity
	private char aliasChar = 64; // 'A'
	
	
	private BiMap<String, Character> activityAlias = null;
	private Map<String, ActivityEntity> activityMap = null;
	private Map<String, ArcEntity> arcsMap = null;
	private Map<String, Integer> tupleOcurrency = null;

	private ActivityEntity lastActivity = null;
	private long lastActivityEndTime = 0L;
	private String currentTuple = "";

	public DependencyGraph(){
		activityAlias = HashBiMap.create();
		arcsMap = new HashMap<String, ArcEntity>();
		tupleOcurrency = new HashMap<String, Integer>();
		activityMap = new HashMap<String, ActivityEntity>();
	}

	public void start(){
		lastActivity = null;
		currentTuple = "";
		lastActivityEndTime = 0L;
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
		
		long activityDuration = (lastActivityEndTime != 0L) ? endTime - lastActivityEndTime : 0L;
		lastActivityEndTime = endTime;
		if (activityDuration < 0){
			activityDuration *= -1;
		}
		
		// Adds the resource and increments counter
		activityEntity.addResource(resource, activityDuration);
		
		if (lastActivity != null){
			appendArc(lastActivity.getUniqueLetter() + "" + activityChar);

			// Updates previous Activity dependences
			activityEntity.addPrev(lastActivity.getName());
			// Updates last Activity dependences
			lastActivity.addNext(activity);
			
		}
		
		lastActivity = activityEntity;
		currentTuple += activityChar;
	}

	public String end(){
		appendTuple(currentTuple);
		return currentTuple;
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

		activityAlias.put(activity, ++aliasChar);
		if (aliasChar == 91){ 	// Change from '[' to 'a'
			aliasChar+=6; 		// Jump 6 char 
		}

		return aliasChar;
	}

	private String padronizeActivity(String activity){
		return activity.trim().toUpperCase();
	}

	/////////////////////// ARC

	private void appendArc(String arc){
		if (arc != null && arc.length() == 2){
			ArcEntity arcEntity = arcsMap.get(arc);
			if (arcEntity == null){
				arcEntity = new ArcEntity(arc);
				
				// Gets the from and to activity name;
				BiMap<Character, String> inverse = activityAlias.inverse();
				
				Character fromChar = arc.charAt(0);
				String from = inverse.get(fromChar);
				arcEntity.setSource(from);
				Character toChar = arc.charAt(1);
				String to = inverse.get(toChar);
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
		return arcsMap.containsKey(c1 + "" + c2) ? ">>" : "  "; 
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
				ArcEntity arcEntity = arcsMap.get(c1 + "" + c2);
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
	//============================================================= 
	// Paralelismo Simples com duas atividades paralelas
	//			 B
	//		   /   \
	//	... - A     D - ...
	//		   \   /
	//			 C
	//============================================================= 
	public void computeParalellism() {
		Set<Character> activitySetChars = activityAlias.values();
		List<Character> activityChars = new ArrayList<Character>();
		activityChars.addAll(activitySetChars);
		Collections.sort(activityChars);
		
		// find B->C C->B
		for (Character c1 : activityChars){
			for (Character c2 : activityChars){
				if (!c1.equals(c2)){
					if (arcsMap.containsKey(c1 + ""+ c2) && arcsMap.containsKey(c2 + ""+ c1)){
						// find A->B and A->C
						Character previous = getMutualPredecessor(c1, c2, activityChars);
						if (previous != null){
							// Find B->D  and C->D
							Character mutualSucessor = getMutualSucessor(c1, c2, activityChars);
							if (mutualSucessor != null){
								arcsMap.remove(c1 + ""+ c2);
								arcsMap.remove(c2 + ""+ c1);
							}
						}
					}
				}
			}
		}
	}

	private Character getMutualPredecessor(Character c1, Character c2, List<Character> activityChars) {
		for (Character previous : activityChars){
			if (!previous.equals(c1) && !previous.equals(c2)){
				if (arcsMap.containsKey(previous + "" + c1) && arcsMap.containsKey(previous + "" + c2)){
					return previous;
				}
			}
		}
		return null;
	}

	private Character getMutualSucessor(Character c1, Character c2, List<Character> activityChars) {
		for (Character next : activityChars){
			if (!next.equals(c1) && !next.equals(c2)){
				if (arcsMap.containsKey(c1 + "" + next) && arcsMap.containsKey(c2 + "" + next)){
					return next;
				}
			}
		}
		return null;
	}
	
	//============================================================= 
	// FIM Paralelismo Simples
	//============================================================= 

	public void computeDependencyMeasure() {
		for (ArcEntity arc : arcsMap.values()){
			Integer inverseCount = getOppositeCount(arc); 
			float divisor = arc.getCount() - inverseCount;
			float dividendus = arc.getCount() + inverseCount + 1f;
			
			arc.setDependencyMeasure(dividendus != 0f ? divisor/dividendus : dividendus);
		}
	}

	private Integer getOppositeCount(ArcEntity arc) {
		String refReversed = arc.getRef().charAt(1) + "" + arc.getRef().charAt(0);
		ArcEntity arcEntity = arcsMap.get(refReversed);
		if (arcEntity == null){
			return 0;
		}
		return arcEntity.getCount();
	}
	
}
