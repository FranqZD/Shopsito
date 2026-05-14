package com.shopbuilder.storage;

/**
 * Thrown when an uploaded file exceeds the maximum allowed size.
 */
public class FileSizeExceededException extends RuntimeException {

    public FileSizeExceededException(String message) {
        super(message);
    }
}
