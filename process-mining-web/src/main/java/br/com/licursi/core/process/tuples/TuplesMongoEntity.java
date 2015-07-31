package br.com.licursi.core.process.tuples;

import java.util.List;

public class TuplesMongoEntity {
	
	private List<Long> times;
	private List<TupleEntity> tuples;
	private String uuid;
	
	public List<Long> getTimes() {
		return times;
	}
	public void setTimes(List<Long> times) {
		this.times = times;
	}
	public List<TupleEntity> getTuples() {
		return tuples;
	}
	public void setTuples(List<TupleEntity> tuples) {
		this.tuples = tuples;
	}
	public String getUuid() {
		return uuid;
	}
	public void setUuid(String uuid) {
		this.uuid = uuid;
	}
	
}
