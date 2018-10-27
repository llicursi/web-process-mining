package br.com.licursi.core.process;

public class ProcessDetailsEntity {

	private Long averageTime;
	private Integer totalCases;

	public ProcessDetailsEntity() {
		this.averageTime = 0L;
		this.totalCases = 0;
	}
	
	public ProcessDetailsEntity(long avgTime, int totalCases) {
		this.averageTime = avgTime;
		this.totalCases = totalCases;
	}

	public Long getAverageTime() {
		return averageTime;
	}

	public void setAverageTime(Long averageTime) {
		this.averageTime = averageTime;
	}

	public Integer getTotalCases() {
		return totalCases;
	}

	public void setTotalCases(int totalCases) {
		this.totalCases = totalCases;
	}
}
