package br.com.licursi.core.process;

import java.util.List;

import br.com.licursi.core.process.cases.CaseMongoEntity;

public class ProcessAndCases {

	private ProcessMongoEntity processEntity;
	private List<CaseMongoEntity> cases;

	public ProcessAndCases(ProcessMongoEntity processEntity, List<CaseMongoEntity> casesWithTimeProcessed) {
		this.processEntity = processEntity;
		this.cases = casesWithTimeProcessed;
		
	}

	public ProcessMongoEntity getProcessEntity() {
		return processEntity;
	}

	public void setProcessEntity(ProcessMongoEntity processEntity) {
		this.processEntity = processEntity;
	}

	public List<CaseMongoEntity> getCases() {
		return cases;
	}

	public void setCases(List<CaseMongoEntity> cases) {
		this.cases = cases;
	}

}
