package br.com.licursi.core.miner;

public enum VariablesEnum {
	CASE_ID("Case Id", "id"),
	ACTIVITY("Activity", "activity"),
	RESOURCE("Resource", "resource"),
	END_TIME("End Time", "endTime");
	
	private String name;
	private String processed; 
	
	private VariablesEnum(String name, String processed) {
		this.name = name;
		this.processed = processed;
	}
	
	@Override
	public String toString(){
		return this.name;
	}
	
	public String p(){
		return this.processed;
	}
}
