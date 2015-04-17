package br.com.licursi.core.eventlog.business;


public class EventLogRefOther {

	private String refName;
	private String refValue;
	
	public EventLogRefOther(String refName, String refValue){
		this.setRefName(refName);
		this.setRefValue(refValue);
	}

	public String getRefName() {
		return refName;
	}

	public void setRefName(String refName) {
		this.refName = refName;
	}

	public String getRefValue() {
		return refValue;
	}

	public void setRefValue(String refValue) {
		this.refValue = refValue;
	}
	
	public String toString(){
		return "{name:" + refName + ", value:" + refValue+  "}";
	}
}



