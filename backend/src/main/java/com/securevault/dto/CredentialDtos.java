package com.securevault.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

public class CredentialDtos {

    @Data
    public static class CredentialRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String username;

        @NotBlank(message = "Password is required")
        private String password;  // plaintext; service encrypts it

        private String url;
        private String category;
        private String notes;
        private String emoji;
    }

    @Data
    public static class CredentialResponse {
        private UUID id;
        private String title;
        private String username;
        private String password;  // decrypted plaintext returned to authenticated owner
        private String url;
        private String category;
        private String notes;
        private String emoji;
        private Instant createdAt;
        private Instant updatedAt;
    }
}
