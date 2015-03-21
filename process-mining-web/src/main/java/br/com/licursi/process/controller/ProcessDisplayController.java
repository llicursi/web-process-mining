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

import br.com.licursi.core.process.entity.ProcessEntity;
import br.com.licursi.core.process.entity.ProcessRepository;

@Controller
@RequestMapping("/process")
public class ProcessDisplayController {

	@Autowired
	private ProcessRepository processRepository;
  
	@RequestMapping("/")
	public String index() {
		return "/process/visualization";
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
	
	
    @RequestMapping("/mongotest/{nome}/")
    @ResponseBody
    public String mongoTest(@PathVariable("nome") String nome) {
    	StringBuilder strBuilder = new StringBuilder();
    	processRepository.save(new ProcessEntity(nome, 1));
    	
    	for (ProcessEntity process : processRepository.findAll()){
    		strBuilder.append(process);
    		strBuilder.append("<br>");
    	}
    	
        return strBuilder.toString();
    }

}