package br.com.licursi.core.process;

import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBObject;

public class ArcEntity {
	
	public static final String SPLIT_CHAR = ">";

	private String ref;
	private String source;
	private String target;
	private Integer count;
	private Integer strength;
	private Float dependencyMeasure;
	
	public ArcEntity(){
		this.count = 0;
		this.dependencyMeasure = 0f;
		this.setStrength(1);
	}
	
	public ArcEntity(String ref){
		this.ref = ref;
		this.count = 0;
		this.dependencyMeasure = 0f;
		this.setStrength(1);
	}
	
	public ArcEntity(String ref, String source, String target){
		this.ref = ref;
		this.source = source;
		this.target = target;
		this.count = 0;
		this.dependencyMeasure = 0f;
	}
	
	public String getRef() {
		return ref;
	}
	public void setRef(String ref) {
		this.ref = ref;
	}
	public String getSource() {
		return source;
	}
	public void setSource(String source) {
		this.source = source;
	}
	public String getTarget() {
		return target;
	}
	public void setTarget(String target) {
		this.target = target;
	}
	public Integer getCount() {
		return count.intValue();
	}
	public void setCount(Integer count) {
		this.count = count;
	}
	public Float getDependencyMeasure() {
		return dependencyMeasure.floatValue();
	}
	public void setDependencyMeasure(Float dependencyMeasure) {
		this.dependencyMeasure = dependencyMeasure;
	}

	public void increment() {
		this.count ++;
	}

	public DBObject toDBObject(){
		BasicDBObjectBuilder objeto = BasicDBObjectBuilder.start();
		objeto.add("ref", this.ref);
		
		if ( this.source != null){
			objeto.add("source", this.source);
		}
		
		if ( this.target != null){
			objeto.add("target", this.target);
		}
		
		objeto.add("count", this.count);
		objeto.add("strength", this.strength);
		return objeto.get();
	}

	public Integer getStrength() {
		return strength;
	}

	public void setStrength(Integer strength) {
		this.strength = strength;
	}
	
	
}
