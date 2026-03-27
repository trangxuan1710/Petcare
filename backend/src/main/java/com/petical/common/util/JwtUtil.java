package com.petical.common.util;

import com.petical.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.expiration}")
    private long expiration;
    @Value("${jwt.issuer}")
    private String issuer;
    private final SecretKey key;

    public JwtUtil(@Value("${jwt.secret}") String secretKey) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer(issuer)
                .setSubject(user.getPhoneNumber())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .claim("role", user.getRole())
                .signWith(key).compact();
    }

    public Claims getClaims(String token) {
        return Jwts.parser().verifyWith(this.key).build().parseClaimsJws(token).getBody();
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            log.warn("Invalid token: {} error: {}", token, e.getMessage());
            return false;
        }
    }
}
