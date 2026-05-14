package com.shopbuilder.exception;

/**
 * Thrown when an uploaded file has an unsupported content type.
 */
public class UnsupportedMediaTypeException extends RuntimeException {

    public UnsupportedMediaTypeException(String message) {
        super(message);
    }
}
