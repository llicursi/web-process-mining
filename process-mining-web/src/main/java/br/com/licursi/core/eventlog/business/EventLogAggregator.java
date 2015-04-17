package br.com.licursi.core.eventlog.business;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;

public class EventLogAggregator {

	private static final String COLLECTION = "eventlog";
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	public List<DBObject> getTop100RecordsFromEventLogRawData(String id){
		
		List<DBObject> pipeline = new ArrayList<DBObject>();
		pipeline.add(BasicDBObjectBuilder.start("$match",  BasicDBObjectBuilder.start("_id",new ObjectId(id)).get()).get());
		pipeline.add(BasicDBObjectBuilder.start("$unwind", "$rawData").get());
		pipeline.add(BasicDBObjectBuilder.start("$limit", 100).get());
		pipeline.add(BasicDBObjectBuilder.start("$project", BasicDBObjectBuilder.start("rawData", 1).get()).get());
		
		System.out.println("json: " + pipeline.toString());
		
		DBCollection collection = mongoTemplate.getCollection(COLLECTION);
		Iterable<DBObject> results = collection.aggregate(pipeline).results();
		
		List<DBObject> rawDataList = new ArrayList<DBObject>();
		int count = 0;
		Iterator<DBObject> iterator = results.iterator();
		while (iterator.hasNext()){
			DBObject next = iterator.next();
			DBObject data =	(DBObject) next.get("rawData");
			rawDataList.add(data);
			
			count++;
			
			System.out.println("data ["+count+"] : " + data);
		}
		
		return rawDataList;
				
	}
	
//	public EventLogDao() throws UnknownHostException {
//			MongoClient mongoClient = new MongoClient("localhost");
//			DB db = mongoClient.getDB("process-mining");
//			Mongo mongo = db.getMongo();
//			mongoTemplate = new MongoTemplate(mongo, "process-mining");
//	}
//	
//	public static void main(String[] args) throws UnknownHostException {
//		EventLogDao event = new EventLogDao();
//		List<DBObject> top100RecordsFromEventLogRawData = event.getTop100RecordsFromEventLogRawData("5521e1b6d4990101279fbe24");
//		
//		System.out.println(top100RecordsFromEventLogRawData.size());
//	}
	
	
}
