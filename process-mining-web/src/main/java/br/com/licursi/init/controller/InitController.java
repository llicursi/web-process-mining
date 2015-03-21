package br.com.licursi.init.controller;

import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class InitController {

	@Autowired
	private MongoTemplate mongoTemplate;

	@ResponseBody
	@RequestMapping(value={"/","/index"})
	public String index() {
		return "Greetings from Spring Boot!";
	}

	@RequestMapping("/welcome")
	public String welcome(Map<String, Object> model) {
		model.put("time", new Date());
		model.put("message", "Database name :" + mongoTemplate.getDb().getName());

		return "welcome";
	}
}
