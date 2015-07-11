package br.com.licursi.core.process;

public class ActivitySimpleEntity {

	private String uniqueLetter;
	private String name;
	private Long endTime;
	private String resource;
	
	
	public String getUniqueLetter() {
		return uniqueLetter;
	}
	public void setUniqueLetter(String uniqueLetter) {
		this.uniqueLetter = uniqueLetter;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Long getEndTime() {
		return endTime;
	}
	public void setEndTime(Long endTime) {
		this.endTime = endTime;
	}
	public String getResource() {
		return resource;
	}
	public void setResource(String resource) {
		this.resource = resource;
	}
}
