package br.com.licursi.adjust.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.mongodb.DBObject;

import br.com.licursi.core.eventlog.business.EventLogAggregator;
import br.com.licursi.core.eventlog.business.EventLogBO;


/**
 * This controller handle the data uploaded and return in json format to show in data table.
 * Also controls the selection of columns from the data table to permits the process miner to properly works.
 *  
 * @author Lucas
 */

@Controller
public class AdjustController {

	@Autowired
	private EventLogBO eventLogBO;

	@RequestMapping(value={"/adjust/{processId}/"})
	public String adjust(@PathVariable("processId") String processId) {
		return "adjust";
	}
	
	@RequestMapping(value={"/adjust/{processId}/data/"})
	@ResponseBody
	public String data(@PathVariable("processId") String processId) {
		String top100RecordsFromEventLog = eventLogBO.getTop100RecordsFromEventLog(processId);
		return top100RecordsFromEventLog;
	}

}
