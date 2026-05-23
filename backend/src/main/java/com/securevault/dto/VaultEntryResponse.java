package com.securevault.dto;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

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
