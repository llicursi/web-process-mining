package br.com.licursi.core.process;


public class ArcTimeEntity {
	
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
}
