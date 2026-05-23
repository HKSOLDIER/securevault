package com.securevault.service;

import com.securevault.model.AuditLog;
import com.securevault.model.User;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final EntityManager entityManager;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(User user, String action, String ip, String userAgent,
                    boolean success, String metadata) {
        try {
            AuditLog.Action auditAction = AuditLog.Action.valueOf(action);
            AuditLog entry = AuditLog.builder()
                .user(user)
                .action(auditAction)
                .ipAddress(ip)
                .userAgent(userAgent != null && userAgent.length() > 500
                    ? userAgent.substring(0, 500) : userAgent)
                .metadata(metadata)
                .success(success)
                .build();
            entityManager.persist(entry);
        } catch (Exception e) {
            log.error("Failed to write audit log for action {} user {}", action,
                user != null ? user.getUsername() : "unknown", e);
        }
    }
}
