package com.revamp.auth.auth.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

@Configuration
public class EmployeeMongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String primaryMongoUri;

    // Primary MongoDB connection - uses Spring Boot configuration from application.properties
    // This ensures the default mongoTemplate bean exists for UserRepository
    @Bean
    @Primary
    public MongoTemplate mongoTemplate() {
        // Extract database name from URI or use default
        String databaseName = "localEAD"; // default
        if (primaryMongoUri.contains("/")) {
            String[] parts = primaryMongoUri.split("/");
            if (parts.length > 1) {
                String dbPart = parts[parts.length - 1];
                if (dbPart.contains("?")) {
                    databaseName = dbPart.split("\\?")[0];
                } else {
                    databaseName = dbPart;
                }
            }
        }
        MongoClient mongoClient = MongoClients.create(primaryMongoUri);
        return new MongoTemplate(mongoClient, databaseName);
    }

    @Value("${spring.data.mongodb.employee.uri:}")
    private String employeeMongoUri;

    @Value("${spring.data.mongodb.employee.database:EAD-Employes}")
    private String employeeDatabaseName;

    // Secondary MongoDB connection for Employee Details in EAD-Employes database
    @Bean
    @Qualifier("employeeMongoTemplate")
    public MongoTemplate employeeMongoTemplate() {
        if (employeeMongoUri == null || employeeMongoUri.isEmpty()) {
            throw new IllegalStateException("Employee MongoDB URI is not configured. Please set spring.data.mongodb.employee.uri");
        }
        
        System.out.println("========================================");
        System.out.println("Creating employeeMongoTemplate bean");
        System.out.println("Database Name: " + employeeDatabaseName);
        System.out.println("Collection: Details");
        System.out.println("========================================");
        
        MongoClient mongoClient = MongoClients.create(employeeMongoUri);
        MongoTemplate template = new MongoTemplate(mongoClient, employeeDatabaseName);
        System.out.println("✓ employeeMongoTemplate created successfully");
        return template;
    }
}

