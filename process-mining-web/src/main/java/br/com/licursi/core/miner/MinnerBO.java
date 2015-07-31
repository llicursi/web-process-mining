package br.com.licursi.core.miner;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.mongodb.DBObject;

import br.com.licursi.core.process.ProcessAndCases;
import br.com.licursi.core.process.ProcessMongoEntity;
import br.com.licursi.core.process.ProcessRepository;
import br.com.licursi.core.process.cases.CaseMongoEntity;

@Component
public class MinnerBO { 
 
	@Autowired
	private ProcessRepository processRepository;
	  
	public Boolean mine(String processId, List<DBObject> mappedRawData){
		
		try {
			FlexibleHeuristicMinner minner = new FlexibleHeuristicMinner(processId);
			ProcessAndCases processAndCases = minner.process(mappedRawData);
			
			ProcessMongoEntity process = processAndCases.getProcessEntity(); 
			List<CaseMongoEntity> cases = processAndCases.getCases();
			processRepository.save(process);
			
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		
	}
	
}
