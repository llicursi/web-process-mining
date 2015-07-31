package br.com.licursi.core.miner;

import java.util.List;

import br.com.licursi.core.miner.exceptions.InvalidDateException;
import br.com.licursi.core.process.ProcessMongoEntity;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;

public class FlexibleHeuristicMinner {

	private final static String ACTIVITIES = "activities";
	
	private String uuid;
	private DependencyGraph dependencyGraph;
	
	public FlexibleHeuristicMinner(String uuid) {
		this.uuid = uuid;
		this.dependencyGraph = new DependencyGraph();
	}
	
	public ProcessMongoEntity process(List<DBObject> mappedData){
		
		// Process Tuple per Tuple
		for (DBObject instance : mappedData){
			processActivities((BasicDBList) instance.get(ACTIVITIES));
		}
		dependencyGraph.printRelationalTable();
		System.out.println("========================================================");
		dependencyGraph.printOcurrancyTable();
		
		ProcessMongoEntity processEntity = dependencyGraph.getProcessedData(this.uuid);
		
		
		return processEntity;
		
	}

	private void processActivities(BasicDBList instance) {
		System.out.println("========================================================");
		if (instance != null){
			try {
				String caseId = "";
				dependencyGraph.start();
				for (Object oActivity : instance){
					DBObject activity = (DBObject) oActivity;
					System.out.println(activity);
					dependencyGraph.put(
						activity.get(VariablesEnum.CASE_ID.p()),
						activity.get(VariablesEnum.ACTIVITY.p()), 
						activity.get(VariablesEnum.END_TIME.p()), 
						activity.get(VariablesEnum.RESOURCE.p()));
					caseId = (String) activity.get(VariablesEnum.CASE_ID.p());
				
				}
				String end = dependencyGraph.end(caseId);
				System.out.println("tuple : " + end);
			
			} catch (InvalidDateException e) {
				System.out.println(e.getLocalizedMessage());
			}
		}
	}
	
}
