package com.shopbuilder.exception;

import java.time.Instant;

/**
 * Consistent error response shape for all API errors.
 */
public record ErrorResponse(String error, int status, String timestamp) {

    /**
     * Convenience constructor that auto-generates an ISO-8601 timestamp.
     */
    public ErrorResponse(String error, int status) {
        this(error, status, Instant.now().toString());
    }
}
