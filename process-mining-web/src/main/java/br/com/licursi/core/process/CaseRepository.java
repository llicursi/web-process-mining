package br.com.licursi.core.process;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import br.com.licursi.core.process.cases.CaseMongoEntity;

public interface CaseRepository extends MongoRepository<CaseMongoEntity, String>{
	
	List<CaseMongoEntity> findAllByUuid(String uuid);
	
	Page<CaseMongoEntity> findAllByUuid(String uuid, Pageable pageable);
	
	Long deleteCaseByUuid(String uuid);
}
