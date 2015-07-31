package br.com.licursi.core.process.events;

import java.util.HashSet;
import java.util.Set;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBObject;

public class BorderEventEntity {
	
	private String name;

	//String length 2
	private String ref;
	private Set<String> previous;
	private Set<String> next;
	private String type;
	
	public BorderEventEntity(String name, String ref){
		this.setNext(new HashSet<String>());
		this.setPrevious(new HashSet<String>());
		this.name = name;
		this.setType(BorderEventType.START);
		setRef(ref);
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public Set<String> getPrevious() {
		return previous;
	}

	public void setPrevious(Set<String> previous) {
		this.previous = new HashSet<String>(previous);
	}

	public Set<String> getNext() {
		return next;
	}

	public void setNext(Set<String> next) {
		this.next = new HashSet<String>(next);
	}
	
	public void addNext(String nextActivity){
		if (nextActivity != null && nextActivity.length() > 0){
			this.next.add(nextActivity);
		}
	}
 
	public void addPrev(String prevActivity){
		if (prevActivity != null && prevActivity.length() > 0){
			this.previous.add(prevActivity);
		}
	}
	

	public String getRef() {
		return (this.ref != null && this.ref.length() >1 ) ? this.ref.substring(0,2) : null;
	}

	public void setRef(String ref) {
		this.ref = (ref != null && ref.length() > 1 ) ? ref.substring(0,2) : null;
	}
	
	private BasicDBList getDBListNext(){
		BasicDBList resourcesList = new BasicDBList();
		if (this.next != null){
			resourcesList.addAll(this.next);
		}
		return resourcesList;
	}
	
	private BasicDBList getDBListPrev(){
		BasicDBList resourcesList = new BasicDBList();
		if (this.previous != null){
			resourcesList.addAll(this.previous);
		}
		return resourcesList;
	}
	
	public DBObject toDBObject(){
		BasicDBObjectBuilder objeto = BasicDBObjectBuilder.start();
		objeto.add("ref", getRef());
		objeto.add("name", this.name);
		objeto.add("next", getDBListNext());
		objeto.add("previous", getDBListPrev());
		return objeto.get();
	}
	
	public String toString(){
		return "\"" +this.name + "\"";
	}

	public String getType() {
		return type;
	}

	/**
	 * Deprecated.<br/>
	 * Please, use the safe <b>set</b>:<br/>
	 * <pre>
	 * setType(BorderEventType type);
	 * </pre>
	 * @param type
	 */
	@Deprecated
	public void setType(String type){
		this.type = type;
	}
	
	public void setType(BorderEventType type) {
		this.type = type.name();
	}

}
