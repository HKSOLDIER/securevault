package com.securevault.model;


import com.securevault.util.InetAddressConverter;
import jakarta.persistence.Convert;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuditLog {

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

    @Convert(converter = InetAddressConverter.class)
    @Column(name = "ip_address", length = 255)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Column(nullable = false)
    @Builder.Default
    private boolean success = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}