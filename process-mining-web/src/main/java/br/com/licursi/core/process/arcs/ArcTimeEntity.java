package br.com.licursi.core.process.arcs;

import br.com.licursi.core.mongo.MongoSizeable;

public class ArcTimeEntity implements MongoSizeable {
	
	private Long start;
	private Long end;
	private String ref;
	private String resource = null;
	private Float cost = null;
	
	public ArcTimeEntity(){
		
	}
	
	public ArcTimeEntity(String ref){
		this.setRef(ref);
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
	public String getResource() {
		return resource;
	}
	public void setResource(String resource) {
		this.resource = resource;
	}

	public String getRef() {
		return ref;
	}

	public void setRef(String ref) {
		this.ref = ref;
	}

	public Float getCost() {
		return cost;
	}

	public void setCost(Float cost) {
		this.cost = cost;
	}

	@Override
	public Long getSize() {
		
		Long size = 
			6L + (start + "").length() +
			4L + (end + "").length();
		
		if (this.ref != null){
			size += 6L + this.ref.length();
		}
		
		if (this.resource != null){
			size += 11L + this.resource.length();
		}
		
		if (this.cost != null){
			size += 5L + this.cost.toString().length();
		}
		
		return size;
	}
}
