package br.com.licursi.process.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
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
	
    @RequestMapping("/mongotest/{nome}/")
    @ResponseBody
    public String mongoTest(@PathVariable("nome") String nome) {
    	StringBuilder strBuilder = new StringBuilder();
    	processRepository.save(new ProcessEntity(nome, 1));
    	
    	for (ProcessEntity process : processRepository.findAll()){
    		strBuilder.append(process);
    		strBuilder.append("\n");
    	}
    	
        return strBuilder.toString();
    }

}