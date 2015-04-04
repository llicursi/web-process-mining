package br.com.licursi.home.controller;

import java.util.Date;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {

	@Autowired
	private MongoTemplate mongoTemplate;

	@RequestMapping(value={"/","/index","/home"})
	public String index() {
		return "home";
	}

	@RequestMapping("/welcome")
	public String welcome(Map<String, Object> model) {
		model.put("time", new Date());
		model.put("message", "Database name :" + mongoTemplate.getDb().getName());

		return "welcome";
	}
}
