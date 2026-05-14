package com.shopbuilder.service;

import com.shopbuilder.dto.AuthResponse;
import com.shopbuilder.dto.LoginRequest;
import com.shopbuilder.dto.RegisterRequest;
import com.shopbuilder.entity.Role;
import com.shopbuilder.entity.User;
import com.shopbuilder.exception.DuplicateEmailException;
import com.shopbuilder.repository.UserRepository;
import com.shopbuilder.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private UserRepository userRepository;
    private JwtService jwtService;
    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        jwtService = mock(JwtService.class);
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, jwtService, passwordEncoder);
    }

    @Test
    void register_shouldCreateUserAndReturnToken() {
        RegisterRequest request = new RegisterRequest("John", "john@example.com", "password123");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.token());
        verify(userRepository).save(argThat(user -> {
            assertEquals("John", user.getName());
            assertEquals("john@example.com", user.getEmail());
            assertEquals(Role.SELLER, user.getRole());
            assertTrue(passwordEncoder.matches("password123", user.getPasswordHash()));
            return true;
        }));
    }

    @Test
    void register_shouldThrowDuplicateEmailException_whenEmailExists() {
        RegisterRequest request = new RegisterRequest("John", "john@example.com", "password123");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(new User()));

        assertThrows(DuplicateEmailException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_shouldReturnToken_whenCredentialsAreValid() {
        LoginRequest request = new LoginRequest("john@example.com", "password123");

        User user = new User();
        user.setId(1L);
        user.setEmail("john@example.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setRole(Role.SELLER);

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.token());
    }

    @Test
    void login_shouldThrowGenericError_whenEmailNotFound() {
        LoginRequest request = new LoginRequest("unknown@example.com", "password123");
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    void login_shouldThrowGenericError_whenPasswordIsWrong() {
        LoginRequest request = new LoginRequest("john@example.com", "wrongpassword");

        User user = new User();
        user.setId(1L);
        user.setEmail("john@example.com");
        user.setPasswordHash(passwordEncoder.encode("correctpassword"));
        user.setRole(Role.SELLER);

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    void login_shouldReturnSameGenericMessage_forBothInvalidEmailAndPassword() {
        // Verify the error message doesn't reveal whether email exists
        LoginRequest badEmail = new LoginRequest("nonexistent@example.com", "password123");
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        RuntimeException emailException = assertThrows(RuntimeException.class, () -> authService.login(badEmail));

        LoginRequest badPassword = new LoginRequest("john@example.com", "wrongpassword");
        User user = new User();
        user.setPasswordHash(passwordEncoder.encode("correctpassword"));
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        RuntimeException passwordException = assertThrows(RuntimeException.class, () -> authService.login(badPassword));

        assertEquals(emailException.getMessage(), passwordException.getMessage());
        assertEquals("Invalid email or password", emailException.getMessage());
    }
}
