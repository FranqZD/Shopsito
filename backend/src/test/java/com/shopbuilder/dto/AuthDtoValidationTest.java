package com.shopbuilder.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class AuthDtoValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    // --- RegisterRequest tests ---

    @Test
    void registerRequest_validData_noViolations() {
        RegisterRequest request = new RegisterRequest("John", "john@example.com", "password1");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    void registerRequest_blankName_hasViolation() {
        RegisterRequest request = new RegisterRequest("", "john@example.com", "password1");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("name")));
    }

    @Test
    void registerRequest_invalidEmail_hasViolation() {
        RegisterRequest request = new RegisterRequest("John", "not-an-email", "password1");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void registerRequest_blankEmail_hasViolation() {
        RegisterRequest request = new RegisterRequest("John", "", "password1");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void registerRequest_passwordTooShort_hasViolation() {
        RegisterRequest request = new RegisterRequest("John", "john@example.com", "pass1");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }

    @Test
    void registerRequest_passwordNoDigit_hasViolation() {
        RegisterRequest request = new RegisterRequest("John", "john@example.com", "password");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }

    @Test
    void registerRequest_passwordExactly8CharsWithDigit_noViolations() {
        RegisterRequest request = new RegisterRequest("John", "john@example.com", "abcdefg1");
        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    // --- LoginRequest tests ---

    @Test
    void loginRequest_validData_noViolations() {
        LoginRequest request = new LoginRequest("john@example.com", "password1");
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty());
    }

    @Test
    void loginRequest_invalidEmail_hasViolation() {
        LoginRequest request = new LoginRequest("not-an-email", "password1");
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void loginRequest_blankEmail_hasViolation() {
        LoginRequest request = new LoginRequest("", "password1");
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void loginRequest_blankPassword_hasViolation() {
        LoginRequest request = new LoginRequest("john@example.com", "");
        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }
}
