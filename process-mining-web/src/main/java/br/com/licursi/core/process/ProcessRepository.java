package br.com.licursi.core.process;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProcessRepository extends MongoRepository<ProcessEntity, String>{
	
	List<ProcessEntity> findAllById(String id);
}
