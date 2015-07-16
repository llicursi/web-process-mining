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

import br.com.licursi.core.eventlog.business.EventLogEntity;
import br.com.licursi.core.util.GenericUtil;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;

public class CSVDataSource implements DataSource{
	
	private BufferedReader stream;
	private boolean processFirstLine = true;
	private List<String> headers;
	

	@Override
	public void setInputStream(InputStream input) {
		stream = new BufferedReader(new InputStreamReader(input));
	}
	
	public EventLogEntity getEventLog() throws IOException{
		
		if (stream == null){
			return null;
		}
	
		EventLogEntity eventLog = new EventLogEntity();
		
		String readLine = stream.readLine();
		headers = GenericUtil.formatKeyHeaders(header(readLine));
		
		String nextLine = stream.readLine();
		
		List<DBObject> rawData = new ArrayList<DBObject>();
		
		
		while (nextLine != null){
			
			Map<String, String> map = processLine(nextLine);
			if (map != null){
				DBObject rawInstance = new BasicDBObject(map);
				rawData.add(rawInstance);
			}
			
			nextLine =stream.readLine();
			
		}
		eventLog.rawData = rawData;
		eventLog.headers = this.headers;
		return eventLog;
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

	private Map<String, String> processLine(String nextLine) {
		
		String[] sline = nextLine.split(spliterLetter);
		Map<String, String> line = new HashMap<String, String>();
		
		for (int i=0; i<sline.length && i < headers.size();i++){
			line.put(headers.get(i), sline[i]);
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
