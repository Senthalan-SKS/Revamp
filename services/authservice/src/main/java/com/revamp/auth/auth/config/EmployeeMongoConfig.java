package com.revamp.auth.auth.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
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
        // Validate MongoDB URI is set
        if (primaryMongoUri == null || primaryMongoUri.trim().isEmpty()) {
            throw new IllegalStateException(
                "\n" +
                "=================================================================\n" +
                "ERROR: MONGO_URI environment variable is not set!\n" +
                "=================================================================\n" +
                "To fix this, set the MONGO_URI environment variable:\n" +
                "  export MONGO_URI=\"mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/localEAD?retryWrites=true&w=majority\"\n\n" +
                "Or use the setup script:\n" +
                "  cd services/authservice\n" +
                "  source setup-env.sh\n\n" +
                "Or create application-local.properties with your MongoDB URI.\n" +
                "=================================================================\n"
            );
        }
        
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
    // This bean is only created if spring.data.mongodb.employee.uri is configured and not empty
    @Bean
    @Qualifier("employeeMongoTemplate")
    @ConditionalOnProperty(
        name = "spring.data.mongodb.employee.uri",
        matchIfMissing = false
    )
    public MongoTemplate employeeMongoTemplate() {
        // Additional check for empty string (environment variable might be set but empty)
        if (employeeMongoUri == null || employeeMongoUri.trim().isEmpty()) {
            throw new IllegalStateException(
                "Employee MongoDB URI is not configured. " +
                "Please set the EMPLOYEE_MONGO_URI environment variable or " +
                "spring.data.mongodb.employee.uri in application.properties. " +
                "See setup-env.sh for an example."
            );
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

