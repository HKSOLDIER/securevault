package com.securevault.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

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

    @NotBlank(message = "Password hash is required")
    @Size(min = 32, message = "Invalid password hash")
    private String clientPasswordHash;
}
