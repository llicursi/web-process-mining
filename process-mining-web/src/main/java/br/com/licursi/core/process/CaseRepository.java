package br.com.licursi.core.process;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import br.com.licursi.core.process.cases.CaseMongoEntity;

public interface CaseRepository extends MongoRepository<CaseMongoEntity, String>{
	
	List<CaseMongoEntity> findAllByUuid(String uuid);
}
