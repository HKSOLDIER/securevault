package com.securevault.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Username or email is required")
    private String identifier;

    @NotBlank(message = "Password hash is required")
    private String clientPasswordHash;
}
