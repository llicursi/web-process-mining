package br.com.licursi.core.process;

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
import com.mongodb.DBObject;

@Component
public class ProcessAggregator {

	private static final String COLLECTION = "process";
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	public DBObject getProcessById(String id){
		//long startTime = System.currentTimeMillis();
		List<DBObject> find = new ArrayList<DBObject>();
		// Query condicions
		DBObject where = BasicDBObjectBuilder.start("_id",new ObjectId(id)).get();
		// Filter conditions
		DBObject filter = BasicDBObjectBuilder
				.start("arcs", 1)
				.add("activities", 1)
				//.add("name", 1)
				.get();
		
		DBCollection collection = mongoTemplate.getCollection(COLLECTION);
		DBObject oneResult = collection.findOne(where, filter);
		
		//System.out.println("Time serializing the data : " + (endTime - startTime));
		return oneResult;
				
	}
	
}
