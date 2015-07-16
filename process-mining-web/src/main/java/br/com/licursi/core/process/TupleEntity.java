package br.com.licursi.core.process;

import java.util.ArrayList;
import java.util.List;


/**
 * TODO -> Melhorar a entidade pai, de forma a ja processar o menor tempo e o maior
 * @author Lucas Licursi
 *
 */
public class TupleEntity {

	private String caseId;
	private Integer caseIndex;
	private String tuple;
	private Long start;
	private Long end;
	private List<ActivitySimpleEntity> activities;
	private List<ArcTimeEntity> arcTimes;
	
	public TupleEntity(){
		activities = new ArrayList<ActivitySimpleEntity>();
		arcTimes = new ArrayList<ArcTimeEntity>();
	}

	
	public Long getStart() {
		return start;
	}
	
	public void setStart(Long start) {
		this.start = start;
	}
	
	public Long getEnd() {
		return end;
	}
	
	public void setEnd(Long end) {
		this.end = end;
	}
	
	public List<ArcTimeEntity> getArcTimes() {
		return arcTimes;
	}
	
	public void setArcTimes(List<ArcTimeEntity> arctimes) {
		this.arcTimes = arctimes;
	}
	
	public void setActivities(List<ActivitySimpleEntity> activities) {
		this.activities = activities;
	}
	
	public List<ActivitySimpleEntity> getActivities() {
		return activities;
	}

	public void putActivity(Character uniqueLetter, String name, long endTime, String resource) {
		ActivitySimpleEntity activityEntity = new ActivitySimpleEntity();
		activityEntity.setEndTime(endTime);
		activityEntity.setName(name);
		activityEntity.setUniqueLetter(uniqueLetter + "");
		activityEntity.setResource(resource);
		this.activities.add(activityEntity);
	}
	
	public void putArc(String ref, Long start, Long end, String resource, Float cost){
		ArcTimeEntity arcTime = new ArcTimeEntity();
		arcTime.setCost(cost);
		arcTime.setEnd(end);
		arcTime.setRef(ref);
		arcTime.setResource(resource);
		arcTime.setStart(start);
		this.arcTimes.add(arcTime);
	}

	public String getTuple() {
		return tuple;
	}

	public void setTuple(String tuple) {
		this.tuple = tuple;
	}


	public String getCaseId() {
		return caseId;
	}


	public void setCaseId(String caseId) {
		this.caseId = caseId;
	}


	public Integer getCaseIndex() {
		return caseIndex;
	}


	public void setCaseIndex(Integer caseIndex) {
		this.caseIndex = caseIndex;
	}
	
}
