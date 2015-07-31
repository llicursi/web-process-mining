package br.com.licursi.core.process.tuples;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TuplesMongoEntity {
	
	private List<Long> startingTimes;
	private List<Long> endingTimes;
	private Map<String, TupleEntity> tuples;
	private String uuid;
	
	public String getUuid() {
		return uuid;
	}
	
	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

	public Map<String, TupleEntity> getTuples() {
		return tuples;
	}

	public void setTuples(Map<String, TupleEntity> tuples) {
		this.tuples = tuples;
	}

	public List<Long> getStartingTimes() {
		return startingTimes;
	}

	public void setStartingTimes(List<Long> startingTimes) {
		this.startingTimes = startingTimes;
	}

	public List<Long> getEndingTimes() {
		return endingTimes;
	}

	public void setEndingTimes(List<Long> endingTimes) {
		this.endingTimes = endingTimes;
	}
	
	public void putTuple(String key, TupleEntity value){
		if (tuples == null){
			tuples = new HashMap<String, TupleEntity>();
		}
		tuples.put(key, value);
	}
	
}
