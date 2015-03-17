package br.com.licursi.core.process.entity;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="process")
public class ProcessEntity {

	@Id
	public String id;
	
	public String name;
	public Integer refId;
	
	public Date start;
	public Date end;
	
	public ProcessEntity(){};
	
	public ProcessEntity(String name, Integer refId){
		this.name = name;
		this.refId = refId;
		this.start = new Date();
	};
	
	@Override
	public String toString() {
		return "{id:"+id + ", name:" + name + ", start :" + start +"}";
	}
	
	
}
