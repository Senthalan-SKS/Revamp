package com.revamp.auth.auth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "Details")
public class EmployeeDetail {
    @Id
    private String id;
    private String userId; // Link to User collection
    private String fullName;
    private String email;
    private String phoneNumber;
    private String[] skills;

    public EmployeeDetail() {}

    public EmployeeDetail(String userId, String fullName, String email, String phoneNumber, String[] skills) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.skills = skills;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String[] getSkills() { return skills; }
    public void setSkills(String[] skills) { this.skills = skills; }
}

