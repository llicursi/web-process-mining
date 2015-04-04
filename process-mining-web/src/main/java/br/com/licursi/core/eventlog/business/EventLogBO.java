package br.com.licursi.core.eventlog.business;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.mongodb.DBObject;

import br.com.licursi.upload.exception.InvalidExtensionException;
import br.com.licursi.upload.exception.UniqueFileException;

public class EventLogBO {

	private static final String EXTENSION_XLS = "xls";
	private static final String EXTENSION_XLSX = "xlsx";
	private static final String EXTENSION_CSV = "csv";
	private static final String CSV_SPLIT_LETTER = ",";
	
	@Autowired
	private MongoTemplate mongoTemplate;

	public void generateEventoLogFromFiles(List<MultipartFile> files) throws UniqueFileException, InvalidExtensionException {
		if (files.size() > 1){
			throw new UniqueFileException("Only one file can be processed");
		}
		
		MultipartFile multipartFile = files.get(0);
		String name = multipartFile.getName();

		String regexValidExtension = "([^\\s]+(\\.(?i)(xls|csv|xlsx))$)";
		if (!name.matches(regexValidExtension)){
			throw new InvalidExtensionException();
		}
		
		try {
			if (name.toLowerCase().endsWith(EXTENSION_CSV)){
				
			} else if (name.toLowerCase().endsWith(EXTENSION_XLS) || name.toLowerCase().endsWith(EXTENSION_XLSX)){
				importCSV(multipartFile);
			}
			
		} catch (IOException e) {
			e.printStackTrace();
		}
		
	}
	
	private void importCSV(MultipartFile multipartFile) throws IOException{
		BufferedReader stream = new BufferedReader(new InputStreamReader(multipartFile.getInputStream()));
		String readLine = stream.readLine();
		String[] sheaders = readLine.split(CSV_SPLIT_LETTER);
		List<String> headers = Arrays.asList(sheaders);
		
		while ((readLine = stream.readLine()) != null){

			String[] sline = readLine.split(CSV_SPLIT_LETTER);
			List<String> lines = Arrays.asList(sheaders);
			
		}
		
		
	}
	
}
