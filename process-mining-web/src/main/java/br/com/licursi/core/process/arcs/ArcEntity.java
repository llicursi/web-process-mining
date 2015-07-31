package br.com.licursi.core.process.arcs;

import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBObject;

public class ArcEntity {
	
	public static final String SPLIT_CHAR = ">";

	private String ref;
	private String source;
	private String target;
	private Integer count;
	private Float dependencyMeasure;
	private Long sumTime;
	
	
	public ArcEntity(){
		this.count = 0;
		this.dependencyMeasure = 0f;
		this.sumTime = 0l;
	}
	
	public ArcEntity(String ref){
		this();
		this.ref = ref;
	}
	
	public ArcEntity(String ref, String source, String target){
		this(ref);
		this.source = source;
		this.target = target;
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
		return objeto.get();
	}


	public void addTime(long timeExpended) {
		this.sumTime += timeExpended;
	}

	public Long getSumTime() {
		return sumTime;
	}

	public void setSumTime(Long sumTime) {
		this.sumTime = sumTime;
	}
	
	
}
