package br.com.licursi.core.miner;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.mongodb.DBObject;

import br.com.licursi.core.process.ProcessEntity;
import br.com.licursi.core.process.ProcessRepository;

@Component
public class MinnerBO { 
 
	@Autowired
	private ProcessRepository processRepository;
	  
	public Boolean mine(String processId, List<DBObject> mappedRawData){
		
		try {
			FlexibleHeuristicMinner minner = new FlexibleHeuristicMinner(processId);
			ProcessEntity process = minner.process(mappedRawData);
			
			processRepository.save(process);
			
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		
	}
	
}
