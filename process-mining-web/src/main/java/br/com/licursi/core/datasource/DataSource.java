package br.com.licursi.core.datasource;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import br.com.licursi.core.eventlog.business.EventLogEntity;

public interface DataSource {
	
	public abstract void setInputStream(InputStream input);

	public abstract void close();
	
	public List<EventLogEntity> getEventLog(UUID randomUUID, String filename) throws IOException;
	
	public abstract String getExtension();
	
}
