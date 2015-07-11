package br.com.licursi.core.eventlog.business;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.mongodb.DBObject;

@Document(collection="eventlog")
public class EventLogEntity {
	
	@Id
	public String id;
	
	public String refProcessId;
	public String refActivity;
	public String refExecutor;
	public Long refEndDate;
	public String refCost;
	public List<EventLogRefOther> refOthers;
	public List<String> headers;
	public List<DBObject> rawData;
	
	public EventLogEntity(){
		
	}
	

}
