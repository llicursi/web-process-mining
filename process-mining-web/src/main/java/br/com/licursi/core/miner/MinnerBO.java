package br.com.licursi.core.miner;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.mongodb.DBObject;

import br.com.licursi.core.process.CaseRepository;
import br.com.licursi.core.process.ProcessAndCases;
import br.com.licursi.core.process.ProcessMongoEntity;
import br.com.licursi.core.process.ProcessRepository;
import br.com.licursi.core.process.cases.CaseMongoEntity;

@Component
public class MinnerBO { 
 
	@Autowired
	private ProcessRepository processRepository;
	
	@Autowired
	private CaseRepository caseRepository;
	
	  
	public Boolean mine(String uuid, String name, List<DBObject> mappedRawData){
		
		try {
			FlexibleHeuristicMinner minner = new FlexibleHeuristicMinner(uuid);
			ProcessAndCases processAndCases = minner.process(mappedRawData);
			
			ProcessMongoEntity process = processAndCases.getProcessEntity();
			process.setName(name);
			List<CaseMongoEntity> cases = processAndCases.getCases();
			processRepository.deleteProcessByUuid(uuid);
			processRepository.save(process);

			caseRepository.deleteCaseByUuid(uuid);
			caseRepository.save(cases);
			
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		
	}
	
}
