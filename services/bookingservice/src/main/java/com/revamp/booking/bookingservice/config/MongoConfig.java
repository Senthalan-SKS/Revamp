package com.revamp.booking.bookingservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

@Configuration
public class MongoConfig {

	@Value("${spring.data.mongodb.uri}")
	private String mongoUri;

	@Value("${spring.data.mongodb.database:bookings}")
	private String databaseName;

	@Bean
	public MongoTemplate mongoTemplate() {
		if (mongoUri == null || mongoUri.trim().isEmpty()) {
			throw new IllegalStateException(
				"ERROR: MongoDB URI is not configured in application.properties!"
			);
		}
		
		// Use the database name from properties, or try to extract from URI
		String dbName = databaseName;
		System.out.println("DEBUG: databaseName from @Value: " + databaseName);
		if (dbName == null || dbName.trim().isEmpty()) {
			// Try to extract from URI if not set in properties
			if (mongoUri.contains("/")) {
				String[] parts = mongoUri.split("/");
				if (parts.length > 1) {
					String dbPart = parts[parts.length - 1];
					if (dbPart.contains("?")) {
						dbName = dbPart.split("\\?")[0];
					} else if (!dbPart.trim().isEmpty()) {
						dbName = dbPart;
					}
				}
			}
			// Fallback if still empty
			if (dbName == null || dbName.trim().isEmpty()) {
				dbName = "bookings";
			}
		}
		
		System.out.println("Creating mongoTemplate for BookingService");
		System.out.println("Database Name: " + dbName);
		
		MongoClient mongoClient = MongoClients.create(mongoUri);
		MongoTemplate template = new MongoTemplate(mongoClient, dbName);
		System.out.println("✓ mongoTemplate created successfully");
		return template;
	}
}

