package br.com.licursi.core.process;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;

@Component
public class ProcessBO {

	@Autowired
	private ProcessAggregator eventLogAggregator;
	
	
	public String getProcessByObjectId(String processID){
		DBObject result = eventLogAggregator.getProcessById(processID);
		long startTime = System.currentTimeMillis();
		String serialized = (result != null) ? JSON.serialize(result) : "";
				
		long endTime = System.currentTimeMillis();
		System.out.println("Time serializing the data : " + (endTime - startTime));
		
		return serialized;
	}
	
}
