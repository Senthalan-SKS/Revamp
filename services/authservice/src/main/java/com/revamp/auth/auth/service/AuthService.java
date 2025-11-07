// src/main/java/com/revamp/auth/auth/service/AuthService.java
package com.revamp.auth.auth.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.revamp.auth.auth.model.User;
import com.revamp.auth.auth.model.VerificationToken;
import com.revamp.auth.auth.repository.UserRepository;
import com.revamp.auth.auth.repository.VerificationTokenRepository;
import com.revamp.auth.auth.util.JwtUtil;

@Service
public class AuthService {
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Autowired
    public AuthService(UserRepository userRepository, VerificationTokenRepository tokenRepository, JwtUtil jwtUtil, EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    public User register(String username, String email, String rawPassword, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }

        String hashed = passwordEncoder.encode(rawPassword);
        User user = new User(username, email, hashed, role != null ? role : "CONSUMER");
        user.setEnabled(false); 
        // return userRepository.save(user);
         User savedUser = userRepository.save(user);

         // Generate verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(
            token,
            savedUser.getId(),
            LocalDateTime.now().plusMinutes(30)
        );
        tokenRepository.save(verificationToken);

        // Send verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), token);

        return savedUser;



    }


    public boolean verifyEmail(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token);
        if (verificationToken == null) return false;
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) return false;

        // Activate user
        String userId = verificationToken.getUserId();
        if (userId == null) {
            throw new RuntimeException("Invalid verification token: user ID is null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(true);
        userRepository.save(user);

        tokenRepository.delete(verificationToken); // cleanup

        return true;
    }



    public String login(String email, String rawPassword) {
        Optional<User> opt = userRepository.findByEmail(email);
        if (!opt.isPresent())
            throw new RuntimeException("Invalid credentials");
        User user = opt.get();
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        // create token with user id and email
        return jwtUtil.generateToken(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUsernameByEmail(String email, String newUsername) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(newUsername);
        return userRepository.save(user);
    }

}
