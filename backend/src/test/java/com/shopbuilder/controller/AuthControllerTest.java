package com.shopbuilder.controller;

import com.shopbuilder.dto.AuthResponse;
import com.shopbuilder.dto.LoginRequest;
import com.shopbuilder.dto.RegisterRequest;
import com.shopbuilder.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class AuthControllerTest {

    private AuthController authController;
    private FakeAuthService fakeAuthService;

    @BeforeEach
    void setUp() {
        fakeAuthService = new FakeAuthService();
        authController = new AuthController(fakeAuthService);
    }

    @Test
    void register_returnsCreatedStatusWithToken() {
        RegisterRequest request = new RegisterRequest("John", "john@example.com", "password1");

        ResponseEntity<AuthResponse> response = authController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("fake-token-register", response.getBody().token());
    }

    @Test
    void login_returnsOkStatusWithToken() {
        LoginRequest request = new LoginRequest("john@example.com", "password1");

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("fake-token-login", response.getBody().token());
    }

    /**
     * A simple fake AuthService for unit testing the controller layer in isolation.
     */
    private static class FakeAuthService extends AuthService {

        FakeAuthService() {
            super(null, null, null);
        }

        @Override
        public AuthResponse register(RegisterRequest request) {
            return new AuthResponse("fake-token-register");
        }

        @Override
        public AuthResponse login(LoginRequest request) {
            return new AuthResponse("fake-token-login");
        }
    }
}
