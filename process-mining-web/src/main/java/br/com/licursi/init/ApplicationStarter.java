package br.com.licursi.init;

import java.util.Arrays;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

@SpringBootApplication
@EnableMongoRepositories("br.com.licursi.core")
@ComponentScan(basePackages="br.com.licursi.*")
public class ApplicationStarter extends SpringBootServletInitializer {
	
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(ApplicationStarter.class);
	}
	
	public static void main(String[] args) {
		ApplicationContext ctx = SpringApplication.run(ApplicationStarter.class, args);

		System.out.println("Let's inspect the beans provided by Spring Boot:");

		String[] beanNames = ctx.getBeanDefinitionNames();
		Arrays.sort(beanNames);
		for (String beanName : beanNames) {
			if (beanName.endsWith("Repository") || beanName.endsWith("Controller")){
				System.out.println(beanName);
			}
		}
	}
	


}