package br.com.licursi.core.process;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProcessRepository extends MongoRepository<ProcessMongoEntity, String>{
	
	List<ProcessMongoEntity> findAllById(String id);
}
