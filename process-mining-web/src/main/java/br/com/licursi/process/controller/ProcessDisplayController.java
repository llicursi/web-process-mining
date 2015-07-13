package br.com.licursi.process.controller;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import br.com.licursi.core.process.ProcessBO;
import br.com.licursi.core.process.ProcessRepository;

@Controller
@RequestMapping("/process")
public class ProcessDisplayController {

	@Autowired
	private ProcessRepository processRepository;
  
	@Autowired
	private ProcessBO processBO;
  
	
	
	@RequestMapping("/")
	public String index() {
		return "/process/visualization";
	}
	
	@RequestMapping(value={"/{processId}/"})
	public String index(@PathVariable("processId") String processId) {
		return "/process/visualization";
	}
	
	@RequestMapping(value={"/{processId}/data/"}, method=RequestMethod.POST,  produces=MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public String dataJsonProcess(@PathVariable("processId") String processId) {
//		List<ProcessEntity> findAllById = processRepository.findAllById(processId);
//		return findAllById.get(0).toDBObject().toString();
		return processBO.getProcessByObjectId(processId).toString();
	}
	
	@RequestMapping(value={"/{processId}/tuples/"}, method=RequestMethod.POST,  produces=MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public String dataJsonTuples(@PathVariable("processId") String processId) {
//		List<ProcessEntity> findAllById = processRepository.findAllById(processId);
//		return findAllById.get(0).toDBObject().toString();
		return processBO.getProcessTuplesByObjectId(processId).toString();
	}
	
	@RequestMapping(value="/data/", method=RequestMethod.POST,  produces=MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public String dataJsonProcessFromFile() throws JSONException{
		ClassLoader classLoader = getClass().getClassLoader();
		FileReader fileReaderJson = null;
		JSONArray jsonErrors = new JSONArray();
		try {
			
			fileReaderJson = new FileReader(classLoader.getResource("json/jsondata.json").getFile());
			
			JSONTokener jsonTokener = new JSONTokener(fileReaderJson);
			
			JSONObject j = new JSONObject(jsonTokener);
			
			return j.toString();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("message", e.getMessage());
			jsonErrors.put(jsonObject);
		} catch (JSONException e) {
			e.printStackTrace();
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("message", e.getMessage());
			jsonErrors.put(jsonObject);
		} finally {
			
			if (fileReaderJson != null){
				try {
					fileReaderJson.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		return jsonErrors.toString();
	}
	
	@RequestMapping(value="/data/", method=RequestMethod.GET)
	@ResponseBody
	public String dataJson(){
		return "{errors:{access: unavailable}}";
	}
	
	
  /*  @RequestMapping("/mongotest/{nome}/")
    @ResponseBody
    public String mongoTest(@PathVariable("nome") String nome) {
    	StringBuilder strBuilder = new StringBuilder();
    	ProcessEntity processEntity = new ProcessEntity(nome);
    	List<ActivityEntity> activities = new ArrayList<ActivityEntity>();
    	ActivityEntity actTeste1 = new ActivityEntity("Teste 1", "A");
    	actTeste1.setCount(2);
    	actTeste1.setType(ActivityType.INITIAL);
    	actTeste1.addResource("Lucas");
    	actTeste1.addResource("Rafael");
    	activities.add(actTeste1);
    	
    	ActivityEntity actTeste2 = new ActivityEntity("Teste 2", "B");
    	actTeste2.setCount(3);
    	actTeste2.setType(ActivityType.END);
    	actTeste2.addResource("Manuel");
    	actTeste2.addResource("Bento");
    	
    	activities.add(actTeste2);
    	processEntity.setActivities(activities);
    	
    	processRepository.save(processEntity);
    	
    	for (ProcessEntity process : processRepository.findAll()){
    		strBuilder.append(process.toDBObject());
    		strBuilder.append("<br>");
    	}
    	
        return strBuilder.toString();
    }
*/
}