package br.com.licursi.core.process;

import java.util.List;

public class TupleEntity {

	private String name;
	private Long start;
	private Long end;
	private List<ArcTimeEntity> arctimes;

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
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
	public List<ArcTimeEntity> getActivities() {
		return arctimes;
	}
	public void setActivities(List<ArcTimeEntity> activities) {
		this.arctimes = activities;
	}
	
}
