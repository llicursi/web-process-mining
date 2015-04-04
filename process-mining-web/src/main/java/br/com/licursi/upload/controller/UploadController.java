package br.com.licursi.upload.controller;

import java.util.Iterator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import br.com.licursi.core.eventlog.business.EventLogBO;
import br.com.licursi.upload.exception.InvalidExtensionException;
import br.com.licursi.upload.exception.UniqueFileException;

@Controller
public class UploadController {

	@Autowired
	private EventLogBO eventLogBO;
	
	private static final String RESPONSE_SUCCESS = "sucess";
	private static final String RESPONSE_ERROR_NONUNIQUE = "nonunique";
	private static final String RESPONSE_ERROR_INVALIDEXTENSION = "invalidextension";

	@RequestMapping(value="/upload", method=RequestMethod.POST)
    public @ResponseBody String handleFileUpload(MultipartHttpServletRequest request){
		@SuppressWarnings("unused")
		Iterator<String> fileNames = request.getFileNames();
		List<MultipartFile> files = request.getFiles("rawdata");
		try {
			eventLogBO.generateEventoLogFromFiles(files);
			return RESPONSE_SUCCESS;
		} catch (UniqueFileException e) {
			e.printStackTrace();
			return RESPONSE_ERROR_NONUNIQUE;
		} catch (InvalidExtensionException e) {
			e.printStackTrace();
			return RESPONSE_ERROR_INVALIDEXTENSION;
		}
	}
}
