package com.securevault.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    record ErrorResponse(int status, String error, String message, Instant timestamp) {}

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {

        ex.printStackTrace();

        return ResponseEntity.status(500).body(
                Map.of(
                        "error", ex.getMessage()
                )
        );
    }
    @ExceptionHandler(AppExceptions.EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailExists(AppExceptions.EmailAlreadyExistsException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(AppExceptions.InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(AppExceptions.InvalidCredentialsException ex) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(AppExceptions.CredentialNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCredentialNotFound(AppExceptions.CredentialNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(AppExceptions.EncryptionException.class)
    public ResponseEntity<ErrorResponse> handleEncryption(AppExceptions.EncryptionException ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Encryption error");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(err -> {
            String field = ((FieldError) err).getField();
            errors.put(field, err.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(errors);
    }



    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message) {
        return ResponseEntity.status(status)
            .body(new ErrorResponse(status.value(), status.getReasonPhrase(), message, Instant.now()));
    }
}
