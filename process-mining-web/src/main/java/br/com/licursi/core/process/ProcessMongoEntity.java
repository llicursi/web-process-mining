package br.com.licursi.core.process;

import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBObject;

import br.com.licursi.core.process.activities.ActivityEntity;
import br.com.licursi.core.process.arcs.ArcEntity;
import br.com.licursi.core.process.cases.CaseEntity;
import br.com.licursi.core.process.events.BorderEventEntity;

@Document(collection="process")
public class ProcessMongoEntity {

	@Id
	private String id;
	private String uuid;
	private String name;
	
	private Map<String,ArcEntity> arcs;
	private Map<String, ActivityEntity> activities;
	private Map<String, BorderEventEntity> borderEvents;
	private ProcessDetailsEntity details;
	
	public ProcessMongoEntity(){
		this.details = new ProcessDetailsEntity();
	}
	
	public ProcessMongoEntity(String uuid){
		this.uuid = uuid;
	}
	
	public ProcessMongoEntity(String name, String uuid){
		this.uuid = uuid;
		this.name = name;
	}
	
	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

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
		if (this.name != null ){
			objeto.add("name", this.name);
		}
		if (this.uuid != null ){
			objeto.add("uuid", this.uuid);
		}
		objeto.add("activities", getActivitiesToDBObject());
		objeto.add("arcs", getArcsToDBObject());
		return objeto.get();
	}
	
	public String toString() {
		return toDBObject().toString();
	}

	public void setDetails(ProcessDetailsEntity processDetailEntity) {
		this.details = processDetailEntity;
	}
	
	public ProcessDetailsEntity getDetails(){
		return details;
	}

}
