package br.com.licursi.core.process.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;

@Component
public class ProcessBO {

	@Autowired
	private ProcessAggregator processAggregator;
	
	public String getProcessByUuid(String processID){
		DBObject result = processAggregator.getProcessById(processID);
		long startTime = System.currentTimeMillis();
		String serialized = (result != null) ? JSON.serialize(result) : "";
				
		long endTime = System.currentTimeMillis();
		System.out.println("Time serializing the data : " + (endTime - startTime));
		
		return serialized;
	}

	public String getProcessTuplesByObjectId(String uuid, Integer page){
		
		DBObject result = processAggregator.getProcessCasesByUuid(uuid, page);
		long startTime = System.currentTimeMillis();
		String serialized = (result != null) ? JSON.serialize(result) : "";
				
		long endTime = System.currentTimeMillis();
		System.out.println("Time serializing the data : " + (endTime - startTime));
		
		return serialized;
	}
	
}
