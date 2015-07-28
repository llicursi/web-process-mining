package br.com.licursi.core.datasource;

import java.io.IOException;
import java.io.InputStream;
<<<<<<< HEAD
import java.util.List;
import java.util.UUID;
=======
>>>>>>> d0c0eea3ff4807bfc40cf3b8a1ff2a6d53d721e3

import br.com.licursi.core.eventlog.business.EventLogEntity;

public interface DataSource {
	
	public abstract void setInputStream(InputStream input);

	public abstract void close();
	
<<<<<<< HEAD
	public List<EventLogEntity> getEventLog(UUID randomUUID) throws IOException;
=======
	public EventLogEntity getEventLog() throws IOException;
>>>>>>> d0c0eea3ff4807bfc40cf3b8a1ff2a6d53d721e3
	
	public abstract String getExtension();
	
}
