package com.renderai.security;

import com.renderai.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:renderai-secret-key-2026-very-secure-jwt-key-architecture-ai-datn-32chars}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration; // 24h mặc định

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Sinh JWT Access Token chứa thông tin định danh và phân quyền
     */
    public String generateToken(Long userId, String username, String email, Role role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("email", email)
                .claim("role", role != null ? role.name() : Role.USER.name())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Kiểm tra tính hợp lệ của Token
     */
    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token.trim());
            return true;
        } catch (ExpiredJwtException e) {
            System.err.println("JWT Token đã hết hạn: " + e.getMessage());
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("JWT Token không hợp lệ: " + e.getMessage());
        }
        return false;
    }

    /**
     * Trích xuất toàn bộ Payload (Claims) từ Token
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token.trim())
                .getPayload();
    }

    /**
     * Trích xuất UserId
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Number) {
            return ((Number) userIdObj).longValue();
        }
        return null;
    }

    /**
     * Trích xuất Username (Subject)
     */
    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    /**
     * Trích xuất Role (ADMIN / USER)
     */
    public String getRoleFromToken(String token) {
        return getClaimsFromToken(token).get("role", String.class);
    }

    /**
     * Trích xuất Email
     */
    public String getEmailFromToken(String token) {
        return getClaimsFromToken(token).get("email", String.class);
    }
}
