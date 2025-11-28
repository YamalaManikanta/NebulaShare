package com.example.nebulashare.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class FileStorageException extends RuntimeException {

    /**
     * Constructor for FileStorageException with a message.
     * @param message The detail message.
     */
    public FileStorageException(String message) {
        super(message);
    }

    /**
     * Constructor for FileStorageException with a message and a cause.
     * @param message The detail message.
     * @param cause The cause of the exception.
     */
    public FileStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}