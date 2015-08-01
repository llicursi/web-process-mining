package br.com.licursi.core.process.cases;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="cases")
public class CaseMongoEntity {
	
	@Id
	private String id;
	private List<Long> startingTimes;
	private List<Long> endingTimes;
	private Map<String, CaseEntity> tuples;
	private String uuid;
	
	public String getUuid() {
		return uuid;
	}
	
	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

	public Map<String, CaseEntity> getTuples() {
		return tuples;
	}

	public void setTuples(Map<String, CaseEntity> tuples) {
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
	
	public void putTuple(String key, CaseEntity value){
		if (tuples == null){
			tuples = new HashMap<String, CaseEntity>();
		}
		tuples.put(key, value);
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
}
