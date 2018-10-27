package br.com.licursi.core.eventlog.business;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

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
public class EventLogAggregator {

	private static final String COLLECTION = "eventlog";
	
	@Autowired
	private MongoTemplate mongoTemplate;
	
	public DBObject getNameFromAnalysis(String uuid){
		long startTime = System.currentTimeMillis();
		
		DBCollection collection = mongoTemplate.getCollection(COLLECTION);
		DBCursor limit = collection.find(BasicDBObjectBuilder.start("uuid", uuid).get(), BasicDBObjectBuilder.start("name", 1).get()).limit(1);
		DBObject one = limit.one();
		long endTime = System.currentTimeMillis();
		System.out.println("Time reading and unwinding the eventLog : " + (endTime - startTime));
		
		return one;
				
	}
	
	public void updateNameAndData(String uuid, String name){
		DBCollection collection = mongoTemplate.getCollection(COLLECTION);
		DBCursor limit = collection.find(BasicDBObjectBuilder.start("uuid", uuid).get()).limit(1);
		DBObject one = limit.one();
		one.put("name", name);
		one.put("isProcessed", true);
		collection.save(one);
	}
	
	public List<DBObject> getTop100RecordsFromEventLogRawData(String uuid){
		long startTime = System.currentTimeMillis();
		List<DBObject> pipeline = new ArrayList<DBObject>();
		pipeline.add(BasicDBObjectBuilder.start("$match",  BasicDBObjectBuilder.start("uuid", uuid).get()).get());
		pipeline.add(BasicDBObjectBuilder.start("$limit", 1).get());
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
		long endTime = System.currentTimeMillis();
		System.out.println("Time reading and unwinding the eventLog : " + (endTime - startTime));
		
		return rawDataList;
				
	}
	
	
	/**
	*   db['eventlog'].aggregate([
	*   	{$match : { "_id" : ObjectId("556e3b014a03f8ad2160a7ea")}},
	*   	{$unwind: "$rawData"}, 
	*   	{$sort:{"rawData.dd-MM-yyyy HH:mm" : 1}}, 
	*   	{$project: { 
	*   		"id": "$rawData.Case ID",
	*   		"endTime" : "$rawData.dd-MM-yyyy HH:mm",
	*   		"activity" : "$rawData.Activity",
	*   		"resource" : "$rawData.Resource",
	*   		"_id":0
	*   		}
	*   	},
	*   	{$group : {
	*   		_id : "$id", 
	*   		activities : { $push : "$$ROOT"}
	*   		}
	*   	},
	*		{$sort:{"activities.startTime" : 1}}
	*   ]);
	*
	 * @param id - ObjectId
	 * @return
	 */
	
	public List<DBObject> getActivitiesFromRowData(String uuid, Map<String, String> mVariables){
		
		List<DBObject> pipeline = new ArrayList<DBObject>();
		pipeline.add(BasicDBObjectBuilder.start("$match",  BasicDBObjectBuilder.start("uuid", uuid).get()).get());
		pipeline.add(BasicDBObjectBuilder.start("$limit", 1).get());
		pipeline.add(BasicDBObjectBuilder.start("$unwind", "$rawData").get());
		pipeline.add(BasicDBObjectBuilder.start("$sort",BasicDBObjectBuilder.start("ISODATE(rawData." + mVariables.get(VariablesEnum.END_TIME.toString()) + ")", 1).get()).get());
		pipeline.add(BasicDBObjectBuilder.start("$project", BasicDBObjectBuilder
				.start("id", "$rawData." + mVariables.get(VariablesEnum.CASE_ID.toString()))
				.add("endTime" , "$rawData." + mVariables.get(VariablesEnum.END_TIME.toString() + ""))
				.add("activity" , "$rawData." + mVariables.get(VariablesEnum.ACTIVITY.toString()))
				.add("resource" , "$rawData." + mVariables.get(VariablesEnum.RESOURCE.toString()))
				.add("_id" , 0)
				.get()
				).get());
		pipeline.add(BasicDBObjectBuilder.start("$group",BasicDBObjectBuilder
				.start("_id", "$id")
				.add("activities" ,  BasicDBObjectBuilder.start("$push", "$$ROOT").get())
				.get()
				).get());
		
		
		System.out.println("json: " + pipeline.toString());
		
		DBCollection collection = mongoTemplate.getCollection(COLLECTION);
		System.out.println(collection.aggregate(pipeline).toString());
		Iterable<DBObject> results = collection.aggregate(pipeline).results();
		
		return Lists.newArrayList(results);
		
	}

	public Iterable<DBObject> listAnalysisByTime() {

		List<DBObject> pipeline = new ArrayList<DBObject>();
		pipeline.add(
			BasicDBObjectBuilder.start("$group",  
				BasicDBObjectBuilder.start("_id", "$uuid")
					.add("date", BasicDBObjectBuilder.start("$max", "$date").get())
					.add("name", BasicDBObjectBuilder.start("$first", "$name").get())
					.add("isProcessed", BasicDBObjectBuilder.start("$first", "$isProcessed").get())
				.get())
			.get());
		pipeline.add(BasicDBObjectBuilder.start("$sort", BasicDBObjectBuilder.start("date", -1).get()).get());
		
		DBCollection collection = mongoTemplate.getCollection(COLLECTION);
		System.out.println(collection.aggregate(pipeline).toString());
		Iterable<DBObject> results = collection.aggregate(pipeline).results();
		
		return results;
		
	}
	
}
