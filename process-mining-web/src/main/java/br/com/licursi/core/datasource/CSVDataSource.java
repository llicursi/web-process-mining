package br.com.licursi.core.datasource;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.licursi.core.eventlog.business.EventLogEntity;
import br.com.licursi.core.util.GenericUtil;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;

public class CSVDataSource implements DataSource{
	
	private BufferedReader stream;
	

	@Override
	public void setInputStream(InputStream input) {
		stream = new BufferedReader(new InputStreamReader(input));
	}
	
	public List<EventLogEntity> getEventLog(UUID randomUUID, String fileName) throws IOException{
		
		if (stream == null){
			return null;
		}
		
		String uuid = randomUUID.toString();
		
		String readLine = stream.readLine();
		List<String> headers = GenericUtil.formatKeyHeaders(header(readLine));

		long sizeHeaders = readLine.getBytes().length + 5* headers.size();
		long sizeAccumulated = 0L;
		
		String nextLine = stream.readLine();
		
		List<DBObject> rawData = new ArrayList<DBObject>();
		List<EventLogEntity> eventLogs = new ArrayList<EventLogEntity>();
		
		while (nextLine != null){
			
			// Loop stop
			if (sizeAccumulated > 15000000){
				EventLogEntity eventLog = new EventLogEntity();
				eventLog.setUuid(uuid);
				eventLog.setHeaders(headers);
				eventLog.setRawData(rawData);
				eventLog.setName(fileName);
				eventLogs.add(eventLog);
				
				// Reset loop variables
				rawData = new ArrayList<DBObject>();
				sizeAccumulated = 0L;
			}
			
			sizeAccumulated += nextLine.getBytes().length + sizeHeaders;
			
			Map<String, String> map = processLineToCSVMap(nextLine, headers);
			if (map != null){
				DBObject rawInstance = new BasicDBObject(map);
				rawData.add(rawInstance);
			}
			
			nextLine = stream.readLine();
			
		}
		
		EventLogEntity eventLog = new EventLogEntity();
		eventLog.setUuid(uuid);
		eventLog.setHeaders(headers);
		eventLog.setRawData(rawData);
		eventLog.setName(fileName);
		eventLogs.add(eventLog);
		
		return eventLogs;
	}
	

	
	private String spliterLetter = SPLITER.DOTCOMMA.letter;
	
	private void indentifySpliterLetter(String firstLine){
		String[] splitComma = firstLine.split(SPLITER.COMMA.letter);
		String[] splitDotComma = firstLine.split(SPLITER.DOTCOMMA.letter);
		this.spliterLetter = (splitComma.length > splitDotComma.length) ? SPLITER.COMMA.letter : SPLITER.DOTCOMMA.letter;
	} 
	
	@Override
	public String getExtension() {
		return "csv";
	}
	
	private enum SPLITER{
		COMMA(","), 
		DOTCOMMA(";");
		
		private String letter;
		
		private SPLITER(String letter){
			this.letter = letter;
		}
		
	}

	private List<String> header(String firstLine) {
		indentifySpliterLetter(firstLine);
		String[] sheaders = firstLine.split(this.spliterLetter);
		
		return Arrays.asList(sheaders);
		//return FileDataSource.NO_HEADER;
	}

	private Map<String, String> processLineToCSVMap(String nextLine, List<String> headers) {
		
		char[] charArray = nextLine.toCharArray();
		String nextWord = "";
		int index = 0;
		int wordCount = 0;
		Map<String, String> line = new HashMap<String, String>();
		int maxWord = headers.size();
		
		boolean isLastCharSplitter = false;
		boolean isWaintingForClosureChar = false;
		
		while (index < charArray.length){
			char actual = charArray[index];
			if (isLastCharSplitter && actual == ' '){
				isLastCharSplitter = true;
			} else {	
				isLastCharSplitter = false;
				if (actual == this.spliterLetter.charAt(0) && !isWaintingForClosureChar){
					if (wordCount < maxWord-1){
						isLastCharSplitter = true;
						line.put(headers.get(wordCount++), nextWord);
						nextWord = "";
					} else {
						String trunked = "";
						while (index < charArray.length){
							trunked += charArray[index];
							index++;
						}
						System.out.println("Line with error, drop exceding text (" + trunked + ")");
					}
				} else if (actual == '"' && !isWaintingForClosureChar){
					isWaintingForClosureChar = true;
				} else if (actual == '"' && isWaintingForClosureChar){
					isWaintingForClosureChar = false;
				} else {
					nextWord += actual;
				}
			}
			index ++;
		}
		line.put(headers.get(wordCount++), nextWord);
		// Fulfill the missing data with null
		while (wordCount < headers.size()){
			line.put(headers.get(wordCount++), "(null)");
		}
		return line;
	}

	@Override
	public void close() {
		if (stream != null){
			try {
				stream.close();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
	}
	
	
	

}
