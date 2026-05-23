package com.securevault.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class VaultEntryRequest {
    @NotBlank
    @Size(max = 255)
    private String siteName;

    @Size(max = 500)
    private String siteUrl;

    @NotBlank
    private String encryptedUsername;

    @NotBlank
    private String encryptedPassword;

    @NotBlank
    private String iv;

    @Size(max = 1000)
    private String notes;

    @Size(max = 100)
    private String category;

    private boolean isFavorite;
}
