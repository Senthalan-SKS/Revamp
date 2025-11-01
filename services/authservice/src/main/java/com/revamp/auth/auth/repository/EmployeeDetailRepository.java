package com.revamp.auth.auth.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.revamp.auth.auth.model.EmployeeDetail;

public interface EmployeeDetailRepository extends MongoRepository<EmployeeDetail, String> {
    Optional<EmployeeDetail> findByUserId(String userId);
    Optional<EmployeeDetail> findByEmail(String email);
    List<EmployeeDetail> findAllByOrderByFullName();
    Boolean existsByEmail(String email);
}

