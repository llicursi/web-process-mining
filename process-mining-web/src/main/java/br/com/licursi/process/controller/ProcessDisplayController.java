package br.com.licursi.process.controller;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.jboss.logging.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.Mapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import br.com.licursi.core.process.entity.ProcessEntity;
import br.com.licursi.core.process.entity.ProcessRepository;

@Controller
public class ProcessDisplayController {

	@Autowired
	private ProcessRepository processRepository;
	
    @RequestMapping("/")
    @ResponseBody
    public String index() {
        return "Greetings from Spring Boot!";
    }
    
    @RequestMapping("/welcome")
    public String welcome(Map<String, Object> model) {
	    model.put("time", new Date());
	    model.put("message", "Teste");
	    return "welcome";
    }
    
    @RequestMapping("/mongo/{nome}/")
    @ResponseBody
    public String mongoTest() {
    	StringBuilder strBuilder = new StringBuilder();
    	processRepository.save(new ProcessEntity("Lucas Licursi", 1));
    	
    	for (ProcessEntity process : processRepository.findAll()){
    		strBuilder.append(process);
    		strBuilder.append("\n");
    	}
    	
        return strBuilder.toString();
    }

}