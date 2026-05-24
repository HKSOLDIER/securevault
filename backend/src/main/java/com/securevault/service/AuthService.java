package com.securevault.service;

import com.securevault.dto.AuthDtos;
import com.securevault.exception.AppExceptions;
import com.securevault.model.User;
import com.securevault.repository.UserRepository;
import com.securevault.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;   // Argon2PasswordEncoder bean
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    /**
     * Register a new user.
     * The master password is hashed with Argon2id before persistence.
     */
    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppExceptions.EmailAlreadyExistsException(request.getEmail());
        }

        // Argon2id hash — computationally expensive by design
        String passwordHash = passwordEncoder.encode(request.getPassword());
        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordHash)
                .verified(false)
                .verificationToken(verificationToken)
                .verificationTokenExpiry(LocalDateTime.now().plusHours(24))
                .build();
        emailService.sendVerificationEmail(
                user.getEmail(),
                verificationToken
        );
        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        return buildAuthResponse(user);
    }

    /**
     * Authenticate and return a JWT.
     * Spring Security's Argon2PasswordEncoder.matches() re-hashes and compares.
     */
    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(AppExceptions.InvalidCredentialsException::new);

        if (!user.isVerified()) {
            throw new RuntimeException(
                    "Please verify your email before login");
        }
        // Argon2id verify — timing-safe comparison
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AppExceptions.InvalidCredentialsException();
        }

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    private AuthDtos.AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        AuthDtos.AuthResponse.UserInfo userInfo = new AuthDtos.AuthResponse.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setName(user.getName());
        userInfo.setEmail(user.getEmail());

        AuthDtos.AuthResponse response = new AuthDtos.AuthResponse();
        response.setAccessToken(token);
        response.setRefreshToken(null);
        response.setUser(userInfo);
        return response;
    }

    @Transactional
    public void verifyEmail(String token) {

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() ->
                        new RuntimeException("Invalid verification token"));

        if (user.getVerificationTokenExpiry()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException("Verification token expired");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);

        userRepository.save(user);
    }
}
