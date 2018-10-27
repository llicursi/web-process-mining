package br.com.licursi.core.process;

import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import br.com.licursi.core.process.activities.ActivityEntity;
import br.com.licursi.core.process.arcs.ArcEntity;
import br.com.licursi.core.process.events.BorderEventEntity;

import com.google.common.collect.BiMap;
import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBObject;

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
	
	// Used at console output, displaying parallelism and occurrence
	@Transient
	private BiMap<String, Character> activityAlias = null;

	// Used at console output, displaying parallelism and occurrence
	@Transient
	private List<String> parallelArcs = null;
	
	
	public ProcessMongoEntity(){
		this.details = new ProcessDetailsEntity();
	}
	
	public ProcessMongoEntity(String uuid){
		this.uuid = uuid;
	}
	
	public ProcessMongoEntity(String name, String uuid){
		this.uuid = uuid;
		this.setName(name);
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
		if (this.getName() != null ){
			objeto.add("name", this.getName());
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

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Transient
	public BiMap<String, Character> getActivityAlias() {
		return activityAlias;
	}

	@Transient
	public void setActivityAlias(BiMap<String, Character> activityAlias) {
		this.activityAlias = activityAlias;
	}

	@Transient
	public List<String> getParallelArcs() {
		return parallelArcs;
	}

	@Transient
	public void setParallelArcs(List<String> parallelArcs) {
		this.parallelArcs = parallelArcs;
	}

}
