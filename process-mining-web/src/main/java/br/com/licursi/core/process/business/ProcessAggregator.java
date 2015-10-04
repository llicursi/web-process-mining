package br.com.licursi.core.process.business;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import br.com.licursi.core.miner.VariablesEnum;

import com.google.common.collect.Lists;
import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;

@Component
public class ProcessAggregator {

	private static final String PROCESS_COLLECTION = "process";
	private static final String CASE_COLLECTION = "cases";
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	public DBObject getProcessById(String uuid){
		//long startTime = System.currentTimeMillis();
		List<DBObject> find = new ArrayList<DBObject>();
		// Query conditions
		DBObject where = BasicDBObjectBuilder.start("uuid",uuid).get();
		
		DBCollection collection = mongoTemplate.getCollection(PROCESS_COLLECTION);
		DBObject oneResult = collection.findOne(where);
		
		//System.out.println("Time serializing the data : " + (endTime - startTime));
		return oneResult;
				
	}
	
	public DBObject getProcessCasesByUuid(String uuid, Integer page){
		//long startTime = System.currentTimeMillis();
		List<DBObject> find = new ArrayList<DBObject>();
		
		// Query condicions
		DBObject where = BasicDBObjectBuilder.start("uuid",uuid).get();
		// Filter conditions
	
		DBCollection collection = mongoTemplate.getCollection(CASE_COLLECTION);
		DBCursor limit = collection.find(where).skip(page).limit(1);
		 
		if( limit.hasNext()){
			DBObject oneResult = limit.one();
			return oneResult;
		}
		
		//System.out.println("Time serializing the data : " + (endTime - startTime));
		return null;
				
	}

}
