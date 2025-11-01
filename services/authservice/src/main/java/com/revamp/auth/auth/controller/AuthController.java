// src/main/java/com/revamp/auth/auth/controller/AuthController.java
package com.revamp.auth.auth.controller;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.revamp.auth.auth.model.User;
import com.revamp.auth.auth.repository.UserRepository;
import com.revamp.auth.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Gateway usually handles CORS, keep for testing
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepository;

    // ✅ Inner DTOs must be static + public
    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;
        public String role;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class AuthResponse {
        public String token;
        public Object user;
        public AuthResponse(String token, Object user) {
            this.token = token;
            this.user = user;
        }
    }

   @PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
    try {
        User created = authService.register(req.username, req.email, req.password, req.role);
        created.setPasswordHash(null);

        return ResponseEntity
            .status(201) // Created
            .body(Collections.singletonMap("message", "User registered successfully"));
    } catch (RuntimeException ex) {
        return ResponseEntity.badRequest()
                .body(Collections.singletonMap("message", ex.getMessage()));
    }
}


    @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    try {
        User user = authService.getUserByEmail(req.email);
        String token = authService.login(req.email, req.password);

        user.setPasswordHash(null); // don't leak hash
        return ResponseEntity.ok(new AuthResponse(
                token,
                Collections.singletonMap("role", user.getRole())
        ));
    } catch (RuntimeException ex) {
        return ResponseEntity.status(401)
                .body(Collections.singletonMap("message", ex.getMessage()));
    }
}

    // Admin endpoint to register employees
    @PostMapping("/register-employee")
    public ResponseEntity<?> registerEmployee(@RequestBody RegisterRequest req) {
        try {
            // Force role to EMPLOYEE for this endpoint
            User created = authService.register(req.username, req.email, req.password, "EMPLOYEE");
            created.setPasswordHash(null); // Don't return password hash

            return ResponseEntity
                .status(201)
                .body(Collections.singletonMap("message", "Employee registered successfully"));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", ex.getMessage()));
        }
    }

    // Get all employees
    @GetMapping("/employees")
    public ResponseEntity<?> getAllEmployees() {
        try {
            List<User> employees = userRepository.findAll()
                .stream()
                .filter(user -> "EMPLOYEE".equals(user.getRole()))
                .peek(user -> user.setPasswordHash(null)) // Remove password hashes
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(employees);
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                    .body(Collections.singletonMap("message", "Error fetching employees: " + ex.getMessage()));
        }
    }

}
