package br.com.licursi.tcc.upload;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping(value="upload/")
@Controller
public class UploadController {

	
	@RequestMapping
	public String initialScreen(){
		
		return "index";
	}
	
}
