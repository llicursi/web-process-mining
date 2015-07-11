package br.com.licursi.core.process;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBObject;

@Document(collection="process")
public class ProcessEntity {

	@Id
	private String id;
	private String name;
	
	private Map<String,ArcEntity> arcs;
	private Map<String, ActivityEntity> activities;
	private Map<String, BorderEventEntity> borderEvents;
	private Map<String, TupleEntity> tuples;
	
	public ProcessEntity(){
	}
	
	public ProcessEntity(String id){
		this.id = id;
	};
	
	public ProcessEntity(String name, String id){
		this.name = name;
		this.id = id;	
	};
	
	public Map<String,ArcEntity> getArcs() {
		return arcs;
	}

	public void setArcs(Map<String,ArcEntity> arcs) {
		this.arcs = arcs;
	}

	public Map<String, ActivityEntity> getActivities() {
		return activities;
	}

	public void setActivities(Map<String, ActivityEntity> activities) {
		this.activities = activities;
	}
	
	public Map<String, BorderEventEntity> getBorderEvents() {
		return borderEvents;
	}

	public void setBorderEvents(Map<String, BorderEventEntity> borderEvents) {
		this.borderEvents = borderEvents;
	}
	
	private DBObject getArcsToDBObject(){
		BasicDBObjectBuilder DBarcs = BasicDBObjectBuilder.start();
		for (ArcEntity arc : this.arcs.values()){
			DBarcs = DBarcs.add(arc.getRef(), arc.toDBObject());
		}
		return DBarcs.get();
	}
	
	private DBObject getActivitiesToDBObject(){
		BasicDBObjectBuilder DBactivities = BasicDBObjectBuilder.start();
		for (ActivityEntity act : this.activities.values()){
			DBactivities = DBactivities.add(act.getName(), act.toDBObject());
		}
		return DBactivities.get();
	}

	public DBObject toDBObject(){
		BasicDBObjectBuilder objeto = BasicDBObjectBuilder.start();
		objeto.add("_id", this.id);
		objeto.add("name", this.name);
		objeto.add("activities", getActivitiesToDBObject());
		objeto.add("arcs", getArcsToDBObject());
		return objeto.get();
	}
	
	public String toString() {
		return toDBObject().toString();
	}

	public Map<String, TupleEntity> getTuples() {
		return tuples;
	}

	public void setTuples(Map<String, TupleEntity> tuples) {
		this.tuples = tuples;
	}
	
}
