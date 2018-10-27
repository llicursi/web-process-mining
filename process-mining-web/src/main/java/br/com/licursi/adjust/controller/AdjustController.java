package br.com.licursi.adjust.controller;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import br.com.licursi.core.eventlog.business.EventLogBO;
import br.com.licursi.core.miner.MinnerBO;

import com.mongodb.DBObject;


/**
 * This controller handle the data uploaded and return in json format to show in data table.
 * Also controls the selection of columns from the data table to permits the process miner to properly works.
 *  
 * @author Lucas
 */

@Controller
@RequestMapping(value={"/adjust"})
public class AdjustController {

	@Autowired
	private EventLogBO eventLogBO;
	
	@Autowired
	private MinnerBO minnerBO;

	@RequestMapping(value={"/{processId}/"})
	public String adjust(@PathVariable("processId") String processId, HttpServletRequest request) {
		String name = eventLogBO.getNameFromAnalysis(processId);
		request.setAttribute("filename", name);
		return "adjust";
	}
	
	@RequestMapping(value={"/{processId}/data/"})
	@ResponseBody
	public String data(@PathVariable("processId") String processId) {
		String top100RecordsFromEventLog = eventLogBO.getTop100RecordsFromEventLog(processId);
		return top100RecordsFromEventLog;
	}
	
	@RequestMapping(value={"/{processId}/minner/"})
	@ResponseBody
	public String processEventLog(@PathVariable("processId") String processId, @RequestParam("analysisName") String analysisName,  @RequestParam("variables[]") String[] variables) throws JSONException {
		
		if (analysisName!=null){
			analysisName.replace("\"", "&amp;");
			analysisName.replace("'", "&amp;");
		}
		
		eventLogBO.updateNameAndSetProcessed(processId, analysisName);
		List<DBObject> mappedRawData = eventLogBO.getMappedRawData(processId, variables);
		Boolean mine = minnerBO.mine(processId,analysisName, mappedRawData);
		
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("status",true);
		jsonObject.put("result", processId);
		
		return jsonObject.toString();
		
	}

	
	
	

}
