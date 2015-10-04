package br.com.licursi.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;

@Configuration
public class MongoConfig {

	/**
	 * DB connection Factory
	 * 
	 * @return a ready to use MongoDbFactory
	 */
	@Bean
	public MongoDbFactory mongoDbFactory() throws Exception {
/*
 * spring.data.mongodb.host=ds045037.mongolab.com
spring.data.mongodb.port=45037
spring.data.mongodb.database=IbmCloud_kfk4tsro_e88bkhmu
spring.data.mongodb.username=llicursi
spring.data.mongodb.password=123456
 * 
 * 
 */
		
	    // Set credentials      
	    MongoCredential credential = MongoCredential.createCredential("llicursi", "IbmCloud_kfk4tsro_e88bkhmu", "123456".toCharArray());
	    ServerAddress serverAddress = new ServerAddress("ds045037.mongolab.com", 45037);

	    // Mongo Client
	    MongoClient mongoClient = new MongoClient(serverAddress,Arrays.asList(credential)); 

	    // Mongo DB Factory
	    SimpleMongoDbFactory simpleMongoDbFactory = new SimpleMongoDbFactory(
	            mongoClient, "IbmCloud_kfk4tsro_e88bkhmu");

	    return simpleMongoDbFactory;
	}

	/**
	 * Template ready to use to operate on the database
	 * 
	 * @return Mongo Template ready to use
	 */
	@Bean
	public MongoTemplate mongoTemplate() throws Exception {
	    return new MongoTemplate(mongoDbFactory());
	}
	
	/*private static final String DATABASE_NAME = "process-mining";
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
	}*/

}
