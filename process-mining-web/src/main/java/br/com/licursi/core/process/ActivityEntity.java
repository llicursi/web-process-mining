package br.com.licursi.core.process;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBObject;

public class ActivityEntity {
	
	private String name;

	//String length 1
	private String uniqueLetter;
	private Integer count;
	private Set<String> previous;
	private Set<String> next;
	private Map<String, List<Long>> resources;
	private Long avgTime;
	private Integer index = -1;

	private ActivityType type;
	
	public ActivityEntity(String name, String uniqueLetter){
		this.resources = new HashMap<String, List<Long>>();
		this.setNext(new HashSet<String>());
		this.setPrevious(new HashSet<String>());
		this.name = name;
		this.count = 0;
		this.avgTime = 0L;
		this.type = ActivityType.NORMAL;
		setUniqueLetter(uniqueLetter);
		this.setIndex(uniqueLetter.charAt(0) - 64);
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public Set<String> getPrevious() {
		return previous;
	}

	public void setPrevious(Set<String> previous) {
		this.previous = new HashSet<String>(previous);
	}

	public Set<String> getNext() {
		return next;
	}

	public void setNext(Set<String> next) {
		this.next = new HashSet<String>(next);
	}
	
	public void addNext(String nextActivity){
		if (nextActivity != null && nextActivity.length() > 0){
			this.next.add(nextActivity);
		}
	}
 
	public void addPrev(String prevActivity){
		if (prevActivity != null && prevActivity.length() > 0){
			this.previous.add(prevActivity);
		}
	}
	
	public ActivityType getType() {
		return type;
	}
	
	public void setType(ActivityType type) {
		this.type = type;
	}

	public String getUniqueLetter() {
		return (this.uniqueLetter != null && this.uniqueLetter.length() >0 ) ? this.uniqueLetter.substring(0,1) : null;
	}

	public void setUniqueLetter(String uniqueLetter) {
		this.uniqueLetter = (uniqueLetter != null && uniqueLetter.length() >0 ) ? uniqueLetter.substring(0,1) : null;
	}

	public Integer getCount() {
		return count;
	}

	public void setCount(Integer count) {
		this.count = count;
	}
	
	/**
	 * Increments the resource control, also increments activity counter
	 * @param resouce
	 * @param time 
	 */
	public void addResource(String resouce, long time){
		this.count ++;
		List<Long> times = this.resources.get(resouce);
		if (times == null){
			times = new ArrayList<Long>();
		}
		times.add(time);
		this.resources.put(resouce, times);
	}
	
	private BasicDBList getDBListResource(){
		BasicDBList resourcesList = new BasicDBList();
		if (this.resources != null){
			resourcesList.add(BasicDBObjectBuilder.start(this.resources).get());
		}
		return resourcesList;
	}
	
	private BasicDBList getDBListNext(){
		BasicDBList resourcesList = new BasicDBList();
		if (this.next != null){
			resourcesList.addAll(this.next);
		}
		return resourcesList;
	}
	
	private BasicDBList getDBListPrev(){
		BasicDBList resourcesList = new BasicDBList();
		if (this.previous != null){
			resourcesList.addAll(this.previous);
		}
		return resourcesList;
	}
	
	public DBObject toDBObject(){
		BasicDBObjectBuilder objeto = BasicDBObjectBuilder.start();
		objeto.add("uniqueLetter", getUniqueLetter());
		objeto.add("name", this.name);
		objeto.add("count", this.count);
		objeto.add("resource", getDBListResource());
		objeto.add("next", getDBListNext());
		objeto.add("previous", getDBListPrev());
		if (this.index != -1){
			objeto.add("index", this.index);
		}
		return objeto.get();
	}
	
	public String toString(){
		return "\"" +this.name + "\"";
	}

	public Map<String, List<Long>> getResource() {
		return resources;
	}

	public void setResource(Map<String, List<Long>> resources) {
		this.resources = resources;
	}

	public Integer getIndex() {
		return index;
	}

	public void setIndex(Integer index) {
		this.index = index;
	}

	public void computeAverageTime(){
		Long sumTime = 0L;
		int counter =0;
		for (List<Long> lists : this.resources.values()){
			if (lists != null){
				for (Long time : lists){
					sumTime += time;
					counter ++;
				}
			}
		}
		this.setAvgTime(counter > 0 ? (long) (sumTime/counter) : 0L);
	}
	
	public Long getAvgTime() {
		return avgTime;
	}

	public void setAvgTime(Long avgTime) {
		this.avgTime = avgTime;
	}
	
}
