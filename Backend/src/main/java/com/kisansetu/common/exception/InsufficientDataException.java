package com.kisansetu.common.exception;

import org.springframework.http.HttpStatus;

public class InsufficientDataException extends ApiException {
    public InsufficientDataException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY, "INSUFFICIENT_DATA");
    }
}
