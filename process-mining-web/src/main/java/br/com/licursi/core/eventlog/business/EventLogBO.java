package br.com.licursi.core.eventlog.business;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import br.com.licursi.core.datasource.CSVDataSource;
import br.com.licursi.core.datasource.DataSource;
import br.com.licursi.core.eventlog.exception.EventLogNotAcceptedException;
import br.com.licursi.core.util.GenericUtil;
import br.com.licursi.upload.exception.InvalidExtensionException;
import br.com.licursi.upload.exception.UniqueFileException;

import com.mongodb.BasicDBObject;
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
					
					EventLogEntity eventLog = dataSource.getEventLog();
					EventLogEntity insert = eventLogRepository.insert(eventLog);
					System.out.println("uid do event log criado:" + insert.id);	
					return insert.id;
				} catch (IOException e) {
					e.printStackTrace();
				} finally {
					dataSource.close();
				}
			}
		}
		
		return "";
		
	}
	
	private String getAvailablesExtensions() {
		String extensionsRegEx = " ";
		for(DataSource dataSource : availablesDataSources){
			String extension = dataSource.getExtension();
			extensionsRegEx += extension + "|";
		}
		return extensionsRegEx.substring(0, extensionsRegEx.length()-1).trim();
	}
	
	public String getTop100RecordsFromEventLog(String processID){
		List<DBObject> top100RecordsFromEventLogRawData = eventLogAggregator.getTop100RecordsFromEventLogRawData(processID);
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
	
}
