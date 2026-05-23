package com.securevault.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "vault_entries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class VaultEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "site_name", nullable = false)
    private String siteName;

    @Column(name = "site_url", length = 500)
    private String siteUrl;

    @Column(name = "encrypted_username", nullable = false)
    private String encryptedUsername;

    @Column(name = "encrypted_password", nullable = false)
    private String encryptedPassword;

    @Column(nullable = false)
    private String iv;

    private String notes;
    private String category;

    @Column(name = "is_favorite")
    @Builder.Default
    private boolean isFavorite = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}