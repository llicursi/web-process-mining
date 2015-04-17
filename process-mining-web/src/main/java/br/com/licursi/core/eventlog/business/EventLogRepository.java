package br.com.licursi.core.eventlog.business;

import org.springframework.data.mongodb.repository.MongoRepository;


public interface EventLogRepository extends MongoRepository<EventLogEntity, String> {
	

}
