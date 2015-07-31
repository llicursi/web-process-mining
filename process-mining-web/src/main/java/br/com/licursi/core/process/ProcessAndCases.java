package br.com.licursi.core.process;

import java.util.List;

import br.com.licursi.core.process.tuples.TuplesMongoEntity;

public class ProcessAndCases {

	private ProcessMongoEntity processEntity;
	private List<TuplesMongoEntity> cases;

	public ProcessAndCases(ProcessMongoEntity processEntity, List<TuplesMongoEntity> casesWithTimeProcessed) {
		this.processEntity = processEntity;
		this.cases = casesWithTimeProcessed;
		
	}

	public ProcessMongoEntity getProcessEntity() {
		return processEntity;
	}

	public void setProcessEntity(ProcessMongoEntity processEntity) {
		this.processEntity = processEntity;
	}

	public List<TuplesMongoEntity> getCases() {
		return cases;
	}

	public void setCases(List<TuplesMongoEntity> cases) {
		this.cases = cases;
	}

}
