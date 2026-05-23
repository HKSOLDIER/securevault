package com.securevault.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

// ─── Register Request ─────────────────────────────────────────────────────────
@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3–50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Username: letters, numbers, _ and - only")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email required")
    @Size(max = 255)
    private String email;

    /**
     * This is the CLIENT-SIDE Argon2id hash, NOT the raw password.
     * The client hashes the password before sending it.
     * Format: base64-encoded argon2id output
     */
    @NotBlank(message = "Password hash is required")
    @Size(min = 32, message = "Invalid password hash")
    private String clientPasswordHash;
}

// ─── Login Request ────────────────────────────────────────────────────────────
@Data
public class LoginRequest {

    @NotBlank(message = "Username or email is required")
    private String identifier;   // username OR email

    /**
     * Client-side Argon2id hash of the raw password.
     */
    @NotBlank(message = "Password hash is required")
    private String clientPasswordHash;
}

// ─── Auth Response ────────────────────────────────────────────────────────────
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;          // seconds
    private UserDto user;
}

// ─── Refresh Token Request ────────────────────────────────────────────────────
@Data
public class RefreshTokenRequest {
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}

// ─── User DTO (safe to expose) ────────────────────────────────────────────────
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private UUID id;
    private String username;
    private String email;
    private String role;
    private boolean emailVerified;
    private OffsetDateTime lastLoginAt;
    private OffsetDateTime createdAt;
}

// ─── Vault Entry DTOs ─────────────────────────────────────────────────────────
@Data
public class VaultEntryRequest {
    @NotBlank
    @Size(max = 255)
    private String siteName;

    @Size(max = 500)
    private String siteUrl;

    @NotBlank
    private String encryptedUsername;  // AES-256-GCM encrypted, base64

    @NotBlank
    private String encryptedPassword;  // AES-256-GCM encrypted, base64

    @NotBlank
    private String iv;                 // IV for AES-GCM, base64

    @Size(max = 1000)
    private String notes;

    @Size(max = 100)
    private String category;

    private boolean isFavorite;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaultEntryResponse {
    private UUID id;
    private String siteName;
    private String siteUrl;
    private String encryptedUsername;
    private String encryptedPassword;
    private String iv;
    private String notes;
    private String category;
    private boolean isFavorite;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

// ─── API Error Response ───────────────────────────────────────────────────────
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private OffsetDateTime timestamp;

    public static ErrorResponse of(int status, String error, String message) {
        return ErrorResponse.builder()
            .status(status)
            .error(error)
            .message(message)
            .timestamp(OffsetDateTime.now())
            .build();
    }
}
