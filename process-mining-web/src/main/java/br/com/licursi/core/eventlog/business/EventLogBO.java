package br.com.licursi.core.eventlog.business;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import br.com.licursi.core.eventlog.exception.EventLogNotAcceptedException;
import br.com.licursi.core.util.GenericUtil;
import br.com.licursi.upload.exception.InvalidExtensionException;
import br.com.licursi.upload.exception.UniqueFileException;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;

@Component
public class EventLogBO {

	private static final String EXTENSION_XLS = "xls";
	private static final String EXTENSION_XLSX = "xlsx";
	private static final String EXTENSION_CSV = "csv";
	private static final String CSV_SPLIT_LETTER = ";";
	
	@Autowired
	private EventLogRepository eventLogRepository;

	public String generateEventoLogFromFiles(List<MultipartFile> files) throws UniqueFileException, InvalidExtensionException, EventLogNotAcceptedException {
		if (files.size() > 1){
			throw new UniqueFileException("Only one file can be processed");
		}
		
		MultipartFile multipartFile = files.get(0);
		String name = multipartFile.getOriginalFilename();

		String regexValidExtension = "([^\\s]+(\\.(?i)(xls|csv|xlsx))$)";
		if (!name.matches(regexValidExtension)){
			throw new InvalidExtensionException();
		}
		
		try {
			if (name.toLowerCase().endsWith(EXTENSION_CSV)){
				return importCSV(multipartFile);
			} else if (name.toLowerCase().endsWith(EXTENSION_XLS) || name.toLowerCase().endsWith(EXTENSION_XLSX)){
				
			}
			
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		return "";
		
	}
	
	public String importCSV(MultipartFile multipartFile) throws IOException, EventLogNotAcceptedException{
		BufferedReader stream = new BufferedReader(new InputStreamReader(multipartFile.getInputStream()));
		String readLine = stream.readLine();
		String[] sheaders = readLine.split(CSV_SPLIT_LETTER);
		
		EventLogEntity eventLog = new EventLogEntity();
		eventLog.headers = GenericUtil.formatKeyHeaders(Arrays.asList(sheaders));
		
		List<DBObject> rawData = new ArrayList<DBObject>();
		eventLog.rawData = rawData;
		
		while ((readLine = stream.readLine()) != null){
			DBObject rawInstance = new BasicDBObject();
			String[] sline = readLine.split(CSV_SPLIT_LETTER);
			List<String> itemsInLine = Arrays.asList(sline);
			
			int index = 0;
			for (String item : itemsInLine){
				rawInstance.put(eventLog.headers.get(index), item);
				index ++;
			}
			rawData.add(rawInstance);
			
		}
		
		try {
			EventLogEntity insert = eventLogRepository.insert(eventLog);
			System.out.println("uid do event log criado:" + insert.id);	
			return insert.id;
		} catch (Exception e) {
			throw new EventLogNotAcceptedException(e);
		}
	}
	
}
