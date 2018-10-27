package br.com.licursi.core.process;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import br.com.licursi.core.process.arcs.ArcEntity;
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

	public void printRelationalTable(boolean computeParallelism){
		
		// Line 1
		String line1 = "  |";
		Set<Character> activitySetChars = this.processEntity.getActivityAlias().values();
		List<Character> activityChars = new ArrayList<Character>();
		activityChars.addAll(activitySetChars);
		Collections.sort(activityChars);

		for (Character c : activityChars){
			line1 += " " + c + "  |";
		}
		System.out.println("" + line1);
		
		// Other lines
		String middleLines = "";
		for (Character c1 : activityChars){
			middleLines = c1 + " |";
			for (Character c2 : activityChars){
				middleLines += " " + activityRelation(c1, c2, computeParallelism) + " |";  
			}
			System.out.println(middleLines);
		}
		
	}

	private String activityRelation(Character c1, Character c2, boolean computeParallelism){
		if (this.getProcessEntity().getParallelArcs().contains(c1 + ArcEntity.SPLIT_CHAR + c2)){
			return computeParallelism ? "||" : ">>";
		}
		return this.getProcessEntity().getArcs().containsKey(c1 + ArcEntity.SPLIT_CHAR + c2) ? ">>" : "  "; 
	}
	
	public void printOcurrancyTable(){
		
		// Line 1
		String line1 = "  |";
		Set<Character> activitySetChars = this.processEntity.getActivityAlias().values();
		List<Character> activityChars = new ArrayList<Character>();
		activityChars.addAll(activitySetChars);
		Collections.sort(activityChars);

		for (Character c : activityChars){
			line1 += " " + c + "  |";
		}
		System.out.println("" + line1);
		
		// Other lines
		String middleLines = "";
		for (Character c1 : activityChars){
			middleLines = c1 + " |";
			for (Character c2 : activityChars){
				ArcEntity arcEntity = this.getProcessEntity().getArcs().get(c1 + ArcEntity.SPLIT_CHAR + c2);
				if (arcEntity != null){
					Integer count = arcEntity.getCount();
					middleLines += " " + count + (count > 9 ? "" : " ") + " |";
				} else{
					middleLines += "    |";
				} 
			}
			System.out.println(middleLines);
		}
		
	}
	
}
