package br.com.licursi.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
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
@EnableMongoRepositories(basePackages="br.com.licursi.core.*")
public class MongoConfig {

	@Value("${spring.data.mongodb.username}")
	private String username;
	
	@Value("${spring.data.mongodb.database}")
	private String database;
	
	@Value("${spring.data.mongodb.password}")
	private String password;
	
	@Value("${spring.data.mongodb.host}")
	private String host;
	
	@Value("${spring.data.mongodb.port}")
	private Integer port;
	
	/**
	 * DB connection Factory
	 * 
	 * @return a ready to use MongoDbFactory
	 */
	@Bean
	public MongoDbFactory mongoDbFactory() throws Exception {

	    // Set credentials      
	    MongoCredential credential = MongoCredential.createCredential(this.username,this.database, this.password.toCharArray());
	    ServerAddress serverAddress = new ServerAddress(this.host, this.port);

	    // Mongo Client
	    MongoClient mongoClient = new MongoClient(serverAddress,Arrays.asList(credential)); 

	    // Mongo DB Factory
	    SimpleMongoDbFactory simpleMongoDbFactory = new SimpleMongoDbFactory(
	            mongoClient, this.database);

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
	
}
