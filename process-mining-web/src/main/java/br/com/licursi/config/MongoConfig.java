package br.com.licursi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.mongodb.DB;
import com.mongodb.Mongo;
import com.mongodb.MongoClient;

@Configuration
public class MongoConfig {
	private static final String DATABASE_NAME = "process-mining";
	private Mongo mongo;
	
	public @Bean Mongo mongo() throws Exception {
		if (mongo == null){
			MongoClient mongoClient = new MongoClient("localhost");
			DB db = mongoClient.getDB(DATABASE_NAME);
			mongo = db.getMongo();
		}

		return mongo;
	}

	public @Bean MongoTemplate mongoTemplate() throws Exception {
		return new MongoTemplate(mongo(), DATABASE_NAME);
	}

}
