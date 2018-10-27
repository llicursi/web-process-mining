package br.com.licursi.home.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import br.com.licursi.core.eventlog.business.EventLogAggregator;

import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBObject;

@Controller
public class HomeController {

	@Autowired
	private EventLogAggregator eventLogAgregator;

	@RequestMapping(value={"/","/index","/home"})
	public String index() {
		return "home";
	}
	@RequestMapping(value="/info")
	public String info() {
		return "info";
	}

	@RequestMapping(value="/list", method=RequestMethod.POST,  produces=MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public String list(Map<String, Object> model) {
		Iterable<DBObject> listAnalysisByTime = eventLogAgregator.listAnalysisByTime();
		DBObject dbObject = BasicDBObjectBuilder.start("list", listAnalysisByTime).get();
		return dbObject.toString();
	}
	
	
	
}
