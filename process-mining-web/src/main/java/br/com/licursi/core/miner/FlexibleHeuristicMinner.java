package br.com.licursi.core.miner;

import java.util.List;

import br.com.licursi.core.process.ProcessEntity;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;

public class FlexibleHeuristicMinner {

	private final static String ACTIVITIES = "activities";
	
	private String _id;
	private DependencyGraph dependencyGraph;
	
	public FlexibleHeuristicMinner(String id) {
		this._id = id;
		this.dependencyGraph = new DependencyGraph();
	}
	
	public ProcessEntity process(List<DBObject> mappedData){
		
		ProcessEntity processEntity = new ProcessEntity(this._id);
		
		// Process Tuple per Tuple
		for (DBObject instance : mappedData){
			String tuple = processActivities((BasicDBList) instance.get(ACTIVITIES));
		}
		dependencyGraph.printRelationalTable();
		System.out.println("========================================================");
		dependencyGraph.printOcurrancyTable();
		
		dependencyGraph.computeParalellism();
		dependencyGraph.computeDependencyMeasure();
		
		processEntity.setActivities(dependencyGraph.getActivities());
		processEntity.setArcs(dependencyGraph.getArcs());
		
		return processEntity;
		
	}

	private String processActivities(BasicDBList activityList) {
		System.out.println("========================================================");
		if (activityList != null){
			dependencyGraph.start();
			for (Object oActivity : activityList){
				DBObject activity = (DBObject) oActivity;
				System.out.println(activity);
				dependencyGraph.put(
						activity.get(VariablesEnum.ACTIVITY.p()), 
						activity.get(VariablesEnum.END_TIME.p()), 
						activity.get(VariablesEnum.RESOURCE.p()));
			}
			String end = dependencyGraph.end();
			
			System.out.println("tuple : " + end);
			return end;
		}
		return null;
		
	}
	
}
