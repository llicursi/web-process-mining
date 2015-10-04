package br.com.licursi.core.eventlog.business;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.joda.time.DateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.mongodb.DBObject;

@Document(collection="eventlog")
public class EventLogEntity {
	
	@Id
	private String id;
	
	private String name;
	private String uuid;
	private List<String> headers;
	private List<DBObject> rawData;
	private DateTime date;
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUuid() {
		return uuid;
	}

	public void setUuid(String uuid) {
		this.uuid = uuid;
	}

	public List<String> getHeaders() {
		return headers;
	}

	public void setHeaders(List<String> headers) {
		this.headers = headers;
	}

	public List<DBObject> getRawData() {
		return rawData;
	}

	public void setRawData(List<DBObject> rawData) {
		if (this.rawData == null){
			this.rawData = new ArrayList<DBObject>();
		}
		this.rawData.addAll(rawData);
	}

	public EventLogEntity(){
		
	}

	public EventLogEntity(String uuid) {
		this.uuid = uuid;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public DateTime getDate() {
		return date;
	}

	public void setDate(DateTime date) {
		this.date = date;
	}

	
	

}
