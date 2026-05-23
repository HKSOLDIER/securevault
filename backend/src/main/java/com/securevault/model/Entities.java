package com.securevault.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

// ─── RefreshToken ─────────────────────────────────────────────────────────────
@Entity
@Table(name = "refresh_tokens")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;   // SHA-256 of the raw token

    @Column(name = "device_info", length = 500)
    private String deviceInfo;

    @Column(name = "ip_address", columnDefinition = "inet")
    private String ipAddress;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean revoked = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public boolean isExpired() {
        return OffsetDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !revoked && !isExpired();
    }
}

// ─── AuditLog ─────────────────────────────────────────────────────────────────
@Entity
@Table(name = "audit_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
class AuditLog {

    public enum Action {
        REGISTER, LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT,
        REFRESH_TOKEN, TOKEN_REVOKED, ACCOUNT_LOCKED,
        VAULT_ENTRY_CREATED, VAULT_ENTRY_DELETED, VAULT_ENTRY_VIEWED,
        PASSWORD_CHANGED, ACCOUNT_DELETED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private Action action;

    @Column(name = "ip_address", columnDefinition = "inet")
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(nullable = false)
    @Builder.Default
    private boolean success = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}

// ─── VaultEntry ───────────────────────────────────────────────────────────────
@Entity
@Table(name = "vault_entries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
class VaultEntry {

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
    private String iv;   // AES-GCM initialization vector (base64)

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
