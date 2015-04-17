package br.com.licursi.adjust.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;


/**
 * This controller handle the data uploaded and return in json format to show in data table.
 * Also controls the selection of columns from the data table to permits the process miner to properly works.
 *  
 * @author Lucas
 */

@Controller
public class AdjustController {

	@Autowired
	private MongoTemplate mongoTemplate;

	@RequestMapping(value={"/adjust/{processId}/"})
	public String adjust() {
		
		
		return "adjust";
	}

}
