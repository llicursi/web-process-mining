package br.com.licursi.core.datasource;

import java.io.IOException;
import java.io.InputStream;

import br.com.licursi.core.eventlog.business.EventLogEntity;

public interface DataSource {
	
	public abstract void setInputStream(InputStream input);

	public abstract void close();
	
	public EventLogEntity getEventLog() throws IOException;
	
	public abstract String getExtension();
	
}
