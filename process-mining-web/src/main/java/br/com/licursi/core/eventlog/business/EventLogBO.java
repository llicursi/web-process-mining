package br.com.licursi.core.eventlog.business;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import br.com.licursi.core.datasource.CSVDataSource;
import br.com.licursi.core.datasource.DataSource;
import br.com.licursi.core.eventlog.exception.EventLogNotAcceptedException;
import br.com.licursi.upload.exception.InvalidExtensionException;
import br.com.licursi.upload.exception.UniqueFileException;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;

@Component
public class EventLogBO {

	
	/**
	 * This list of available data source could be automatize
	 * to support any datasource and loads all of then annotated or
	 * thats extends DataSource file
	 */
	private List<DataSource> availablesDataSources = null;
	
	public EventLogBO() {
		availablesDataSources = new ArrayList<DataSource>();
		availablesDataSources.add(new CSVDataSource());
	}
	
	@Autowired
	private EventLogRepository eventLogRepository;
	
	@Autowired
	private EventLogAggregator eventLogAggregator;

	public String generateEventoLogFromFiles(List<MultipartFile> files) throws UniqueFileException, InvalidExtensionException, EventLogNotAcceptedException {
		
		if (files.size() > 1){
			throw new UniqueFileException("Only one file can be processed");
		}
		
		
		MultipartFile multipartFile = files.get(0);
		String name = multipartFile.getOriginalFilename();
		
		System.out.println("Content type :" + multipartFile.getContentType());
		
		String regexValidExtension = "(.+(\\.(?i)("+getAvailablesExtensions()+"))$)";
		if (!name.matches(regexValidExtension)){
			throw new InvalidExtensionException();
		}
		
		for (DataSource dataSource : availablesDataSources){
			if (name.trim().endsWith(dataSource.getExtension())){
				
				System.out.println("File : " + name + " matched with the extension " + dataSource.getExtension());
				try {
					dataSource.setInputStream(multipartFile.getInputStream());
					
					long startTime = System.currentTimeMillis();
					UUID randomUUID = java.util.UUID.randomUUID();
					List<EventLogEntity> eventLogs = dataSource.getEventLog(randomUUID, name);
					
					DateTime dateTime = new DateTime();
					for (EventLogEntity e : eventLogs ){
						e.setName(name);
						e.setDate(dateTime);
					}
					long endTime = System.currentTimeMillis();
					System.out.println("Time processing CSVDataSource : " + (endTime - startTime) + "ms" );
					List<EventLogEntity> insert = eventLogRepository.insert(eventLogs);
					System.out.println("UUID : " + randomUUID + " N� of Files : "+ insert.size());	
					return randomUUID.toString();
				} catch (IOException e) {
					e.printStackTrace();
				} finally {
					dataSource.close();
				}
			}
		}
		
		return "";
		
	}
	
	public void updateNameAndSetProcessed(String uuid, String name){
		eventLogAggregator.updateNameAndData(uuid, name);
	}
	
	private String getAvailablesExtensions() {
		String extensionsRegEx = " ";
		for(DataSource dataSource : availablesDataSources){
			String extension = dataSource.getExtension();
			extensionsRegEx += extension + "|";
		}
		return extensionsRegEx.substring(0, extensionsRegEx.length()-1).trim();
	}
	
	public String getTop100RecordsFromEventLog(String uuid){
		List<DBObject> top100RecordsFromEventLogRawData = eventLogAggregator.getTop100RecordsFromEventLogRawData(uuid);
		long startTime = System.currentTimeMillis();
		String serialized = JSON.serialize(top100RecordsFromEventLogRawData);
				
		long endTime = System.currentTimeMillis();
		System.out.println("Time serializing the data : " + (endTime - startTime));
		
		return serialized;
	}
	
	public List<DBObject> getMappedRawData(String processID, String[] variables){
		
		Map<String, String> convertToMapped = convertToMapped(variables);
		
		List<DBObject> activitiesFromRowData = eventLogAggregator.getActivitiesFromRowData(processID,convertToMapped);
		
		return activitiesFromRowData;
	}
	
	private Map<String, String> convertToMapped(String[] variables) {
		
		Map<String, String> mapped = new HashMap<String, String>();
		for (int i =0; i < variables.length; i ++){
			String[] partialVar = variables[i].split("[|][|][|]");
			mapped.put(partialVar[0], partialVar[1]);
		}
		return mapped;
	}

	public String getNameFromAnalysis(String processId) {
		DBObject nameFromAnalysis = eventLogAggregator.getNameFromAnalysis(processId);
		String name = "";
		if (nameFromAnalysis != null && nameFromAnalysis.get("name") != null){
			name = nameFromAnalysis.get("name").toString();
		}
		return name;
	}
	
}
