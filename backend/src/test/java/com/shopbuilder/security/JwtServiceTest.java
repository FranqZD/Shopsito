package com.shopbuilder.security;

import com.shopbuilder.entity.Role;
import com.shopbuilder.entity.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    // A valid base64-encoded 256-bit secret for HMAC-SHA256
    private static final String TEST_SECRET = "dGhpcyBpcyBhIGRldmVsb3BtZW50IHNlY3JldCBrZXkgdGhhdCBzaG91bGQgYmUgcmVwbGFjZWQgaW4gcHJvZHVjdGlvbg==";
    private static final long TEST_EXPIRATION_MS = 86400000L; // 24 hours

    @BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();
        setField(jwtService, "secret", TEST_SECRET);
        setField(jwtService, "expirationMs", TEST_EXPIRATION_MS);
    }

    @Test
    void generateToken_shouldContainCorrectSubject() {
        User user = createTestUser();

        String token = jwtService.generateToken(user);
        Claims claims = jwtService.extractClaims(token);

        assertEquals(user.getEmail(), claims.getSubject());
    }

    @Test
    void generateToken_shouldContainUserIdClaim() {
        User user = createTestUser();

        String token = jwtService.generateToken(user);
        Claims claims = jwtService.extractClaims(token);

        assertEquals(user.getId().intValue(), claims.get("userId", Integer.class));
    }

    @Test
    void generateToken_shouldContainNameClaim() {
        User user = createTestUser();

        String token = jwtService.generateToken(user);
        Claims claims = jwtService.extractClaims(token);

        assertEquals(user.getName(), claims.get("name", String.class));
    }

    @Test
    void generateToken_shouldContainRoleClaim() {
        User user = createTestUser();

        String token = jwtService.generateToken(user);
        Claims claims = jwtService.extractClaims(token);

        assertEquals(user.getRole().name(), claims.get("role", String.class));
    }

    @Test
    void generateToken_shouldHaveExpirationInFuture() {
        User user = createTestUser();

        String token = jwtService.generateToken(user);
        Claims claims = jwtService.extractClaims(token);

        assertTrue(claims.getExpiration().after(claims.getIssuedAt()));
    }

    @Test
    void isTokenValid_shouldReturnTrueForValidToken() {
        User user = createTestUser();

        String token = jwtService.generateToken(user);

        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void isTokenValid_shouldReturnFalseForExpiredToken() throws Exception {
        // Create a service with 0ms expiration to generate an already-expired token
        JwtService expiredService = new JwtService();
        setField(expiredService, "secret", TEST_SECRET);
        setField(expiredService, "expirationMs", 0L);

        User user = createTestUser();
        String token = expiredService.generateToken(user);

        // Small delay to ensure token is expired
        Thread.sleep(10);

        assertFalse(jwtService.isTokenValid(token));
    }

    @Test
    void isTokenValid_shouldReturnFalseForTamperedToken() {
        User user = createTestUser();
        String token = jwtService.generateToken(user);

        // Tamper with the token by modifying a character in the signature
        String tamperedToken = token.substring(0, token.length() - 2) + "xx";

        assertFalse(jwtService.isTokenValid(tamperedToken));
    }

    @Test
    void isTokenValid_shouldReturnFalseForMalformedToken() {
        assertFalse(jwtService.isTokenValid("not.a.valid.token"));
    }

    @Test
    void isTokenValid_shouldReturnFalseForEmptyToken() {
        assertFalse(jwtService.isTokenValid(""));
    }

    @Test
    void isTokenValid_shouldReturnFalseForWrongSecret() throws Exception {
        User user = createTestUser();
        String token = jwtService.generateToken(user);

        // Create a service with a different secret
        JwtService otherService = new JwtService();
        setField(otherService, "secret", "YW5vdGhlciBzZWNyZXQga2V5IHRoYXQgaXMgZGlmZmVyZW50IGZyb20gdGhlIG9yaWdpbmFsIG9uZSB1c2VkIGhlcmU=");
        setField(otherService, "expirationMs", TEST_EXPIRATION_MS);

        assertFalse(otherService.isTokenValid(token));
    }

    private User createTestUser() {
        User user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setRole(Role.SELLER);
        return user;
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
