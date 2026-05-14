package com.shopbuilder.exception;

import java.nio.file.AccessDeniedException;
import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void handleNotFound_returns404WithMessage() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Product not found");

        ResponseEntity<ErrorResponse> response = handler.handleNotFound(ex);

        assertEquals(404, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Product not found", response.getBody().error());
        assertEquals(404, response.getBody().status());
        assertNotNull(response.getBody().timestamp());
        assertDoesNotThrow(() -> Instant.parse(response.getBody().timestamp()));
    }

    @Test
    void handleAccessDenied_returns403() throws AccessDeniedException {
        AccessDeniedException ex = new AccessDeniedException("denied");

        ResponseEntity<ErrorResponse> response = handler.handleAccessDenied(ex);

        assertEquals(403, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Insufficient permissions", response.getBody().error());
        assertEquals(403, response.getBody().status());
    }

    @Test
    void handleSpringSecurityAccessDenied_returns403() {
        org.springframework.security.access.AccessDeniedException ex =
                new org.springframework.security.access.AccessDeniedException("denied");

        ResponseEntity<ErrorResponse> response = handler.handleSpringSecurityAccessDenied(ex);

        assertEquals(403, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Insufficient permissions", response.getBody().error());
        assertEquals(403, response.getBody().status());
    }

    @Test
    void handleDuplicateEmail_returns409WithMessage() {
        DuplicateEmailException ex = new DuplicateEmailException("Email already in use");

        ResponseEntity<ErrorResponse> response = handler.handleDuplicateEmail(ex);

        assertEquals(409, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Email already in use", response.getBody().error());
        assertEquals(409, response.getBody().status());
    }

    @Test
    void handleValidation_returns400WithJoinedFieldErrors() throws NoSuchMethodException {
        // Create a real BindingResult with field errors (no mocking needed)
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "request");
        bindingResult.addError(new FieldError("request", "email", "must not be blank"));
        bindingResult.addError(new FieldError("request", "name", "must not be blank"));

        MethodParameter methodParameter = new MethodParameter(
                this.getClass().getDeclaredMethod("handleValidation_returns400WithJoinedFieldErrors"), -1);
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

        ResponseEntity<ErrorResponse> response = handler.handleValidation(ex);

        assertEquals(400, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().error().contains("email: must not be blank"));
        assertTrue(response.getBody().error().contains("name: must not be blank"));
        assertEquals(400, response.getBody().status());
    }

    @Test
    void handleMaxUploadSize_returns413() {
        MaxUploadSizeExceededException ex = new MaxUploadSizeExceededException(5_000_000);

        ResponseEntity<ErrorResponse> response = handler.handleMaxUploadSize(ex);

        assertEquals(413, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("File size exceeds the maximum allowed size", response.getBody().error());
        assertEquals(413, response.getBody().status());
    }

    @Test
    void handleUnsupportedMediaType_returns415WithMessage() {
        UnsupportedMediaTypeException ex = new UnsupportedMediaTypeException("Only JPEG, PNG, and WebP are supported");

        ResponseEntity<ErrorResponse> response = handler.handleUnsupportedMediaType(ex);

        assertEquals(415, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Only JPEG, PNG, and WebP are supported", response.getBody().error());
        assertEquals(415, response.getBody().status());
    }

    @Test
    void handleGeneral_returns500WithGenericMessage() {
        Exception ex = new RuntimeException("unexpected error");

        ResponseEntity<ErrorResponse> response = handler.handleGeneral(ex);

        assertEquals(500, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Internal server error", response.getBody().error());
        assertEquals(500, response.getBody().status());
    }

    @Test
    void errorResponse_convenienceConstructor_generatesIso8601Timestamp() {
        ErrorResponse response = new ErrorResponse("test error", 400);

        assertNotNull(response.timestamp());
        assertDoesNotThrow(() -> Instant.parse(response.timestamp()));
    }

    @Test
    void errorResponse_fullConstructor_preservesAllFields() {
        String timestamp = "2024-01-15T10:30:00Z";
        ErrorResponse response = new ErrorResponse("test error", 404, timestamp);

        assertEquals("test error", response.error());
        assertEquals(404, response.status());
        assertEquals(timestamp, response.timestamp());
    }
}
