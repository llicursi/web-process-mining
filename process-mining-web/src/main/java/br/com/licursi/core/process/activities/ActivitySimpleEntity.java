package br.com.licursi.core.process.activities;

import br.com.licursi.core.mongo.MongoSizeable;

public class ActivitySimpleEntity implements MongoSizeable {

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
	@Override
	public Long getSize() {
		
		Long size = 0L;
		
		if (this.uniqueLetter != null){
			size += 16L + this.uniqueLetter.length() + 1;
		}
		
		if (this.resource != null){
			size += 11L + this.resource.length() + 1;
		}
		
		if (this.endTime != null){
			size += 7L + this.endTime.toString().length() + 1;
		}
		
		if (this.name != null){
			// name : "x"
			size += 6L + this.name.length() + 1; 
		}
		
		return size;
	}
}
