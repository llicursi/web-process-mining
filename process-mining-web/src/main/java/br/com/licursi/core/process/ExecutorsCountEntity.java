package br.com.licursi.core.process;

public class ExecutorsCountEntity {

	private String executor;
	private Integer count;
	
	public ExecutorsCountEntity(){
		
	}
	
	public ExecutorsCountEntity(String executor, Integer count){
		this.count = count;
		this.executor = executor;
	}
	
	public Integer getCount() {
		return count;
	}
	
	public void setCount(Integer count) {
		this.count = count;
	}
	
	public String getExecutor() {
		return executor;
	}
	
	public void setExecutor(String executor) {
		this.executor = executor;
	}
	
}
