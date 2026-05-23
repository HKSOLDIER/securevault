package com.securevault.service;

import com.securevault.dto.*;
import com.securevault.exception.*;
import com.securevault.model.User;
import com.securevault.repository.UserRepository;
import com.securevault.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    @Value("${security.jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    // ─── Register ─────────────────────────────────────────────────────────────
    @Transactional
    public AuthResponse register(RegisterRequest req, String ip, String userAgent) {
        // Check duplicates
        if (userRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new ConflictException("Email already registered");
        }
        if (userRepository.existsByUsernameIgnoreCase(req.getUsername())) {
            throw new ConflictException("Username already taken");
        }

        // Server-side Argon2id hash of the client's Argon2id hash + pepper
        String serverHash = passwordEncoder.encode(req.getClientPasswordHash());

        User user = User.builder()
            .username(req.getUsername().toLowerCase())
            .email(req.getEmail().toLowerCase())
            .passwordHash(serverHash)
            .role(User.Role.USER)
            .build();

        user = userRepository.save(user);
        userRepository.flush();
        auditService.log(user, "REGISTER", ip, userAgent, true, null);

        log.info("New user registered: {} ({})", user.getUsername(), user.getId());
        return issueTokens(user, ip, userAgent);
    }

    // ─── Login ────────────────────────────────────────────────────────────────
    @Transactional
    public AuthResponse login(LoginRequest req, String ip, String userAgent) {
        String identifier = req.getIdentifier().toLowerCase().trim();

        // Find by username or email
        User user = userRepository.findByUsernameOrEmail(identifier, identifier)
            .orElseThrow(() -> {
                log.warn("Login attempt with unknown identifier: {}", identifier);
                return new AuthException("Invalid credentials");
            });

        // Check account status
        if (!user.isEnabled()) {
            throw new AuthException("Account is disabled");
        }
        if (user.isCurrentlyLocked()) {
            long minutes = OffsetDateTime.now()
                .until(user.getLockedUntil(), java.time.temporal.ChronoUnit.MINUTES);
            throw new AccountLockedException(
                "Account locked. Try again in " + (minutes + 1) + " minutes."
            );
        }

        // Verify password (constant-time)
        boolean valid = passwordEncoder.matches(req.getClientPasswordHash(), user.getPasswordHash());

        if (!valid) {
            handleFailedAttempt(user);
            auditService.log(user, "LOGIN_FAILED", ip, userAgent, false, null);
            throw new AuthException("Invalid credentials");
        }

        // Reset failed attempts on success
        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        auditService.log(user, "LOGIN_SUCCESS", ip, userAgent, true, null);
        return issueTokens(user, ip, userAgent);
    }

    // ─── Refresh ──────────────────────────────────────────────────────────────
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest req, String ip, String userAgent) {
        String tokenHash = jwtService.hashRefreshToken(req.getRefreshToken());

        var refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new AuthException("Invalid refresh token"));

        if (!refreshToken.isValid()) {
            refreshTokenRepository.delete(refreshToken);
            throw new AuthException("Refresh token expired or revoked");
        }

        User user = refreshToken.getUser();

        // Rotate: revoke old, issue new
        refreshTokenRepository.delete(refreshToken);
        auditService.log(user, "REFRESH_TOKEN", ip, userAgent, true, null);

        return issueTokens(user, ip, userAgent);
    }

    // ─── Logout ───────────────────────────────────────────────────────────────
    @Transactional
    public void logout(String refreshTokenRaw, User user, String ip, String userAgent) {
        String tokenHash = jwtService.hashRefreshToken(refreshTokenRaw);
        refreshTokenRepository.findByTokenHash(tokenHash)
            .ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        auditService.log(user, "LOGOUT", ip, userAgent, true, null);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────
    private AuthResponse issueTokens(User user, String ip, String userAgent) {
        String accessToken  = jwtService.generateAccessToken(user);
        String rawRefresh   = jwtService.generateRefreshToken();
        String hashRefresh  = jwtService.hashRefreshToken(rawRefresh);

        // Persist refresh token
        var rt = com.securevault.model.RefreshToken.builder()
            .user(user)
            .tokenHash(hashRefresh)
            .ipAddress(ip)
            .deviceInfo(truncate(userAgent, 500))
            .expiresAt(OffsetDateTime.now().plusSeconds(
                jwtService.getRefreshTokenExpiryMs() / 1000))
            .build();
        refreshTokenRepository.save(rt);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(rawRefresh)
            .tokenType("Bearer")
            .expiresIn(accessTokenExpiryMs / 1000)
            .user(toDto(user))
            .build();
    }

    private void handleFailedAttempt(User user) {
        int attempts = user.getFailedLoginCount() + 1;
        user.setFailedLoginCount(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(OffsetDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
            log.warn("Account locked after {} attempts: {}", attempts, user.getUsername());
        }
        userRepository.save(user);
    }

    private UserDto toDto(User u) {
        return UserDto.builder()
            .id(u.getId())
            .username(u.getUsername())
            .email(u.getEmail())
            .role(u.getRole().name())
            .emailVerified(u.isEmailVerified())
            .lastLoginAt(u.getLastLoginAt())
            .createdAt(u.getCreatedAt())
            .build();
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }
}
