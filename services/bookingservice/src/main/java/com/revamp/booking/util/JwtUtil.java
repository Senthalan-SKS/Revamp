package com.revamp.booking.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims parseToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        return Jwts.parserBuilder()
                .setSigningKey(getSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getCustomerId(Claims claims) {
        return claims.getSubject();
    }

    public String getCustomerName(Claims claims) {
        return claims.get("username", String.class);
    }

    public String getCustomerEmail(Claims claims) {
        return claims.get("email", String.class);
    }

    public String getRole(Claims claims) {
        String role = claims.get("role", String.class);
        if (role == null) {
            // Try roles array
            Object roles = claims.get("roles");
            if (roles instanceof java.util.List) {
                java.util.List<?> rolesList = (java.util.List<?>) roles;
                if (!rolesList.isEmpty()) {
                    role = String.valueOf(rolesList.get(0));
                }
            }
        }
        return role;
    }

    public boolean isAdmin(Claims claims) {
        String role = getRole(claims);
        return "ADMIN".equalsIgnoreCase(role);
    }
}

