package com.securevault.config;

import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

@Configuration
public class AppConfig {

    @Value("${security.cors.allowed-origins}")
    private String allowedOrigins;

    // ─── CORS ─────────────────────────────────────────────────────────────────
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
            "Authorization", "Content-Type", "X-Requested-With", "X-Client-Hash"
        ));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // ─── Argon2id Password Encoder ────────────────────────────────────────────
    /**
     * Custom PasswordEncoder using Argon2id (Bouncy Castle).
     *
     * NOTE: The client already sends argon2id(password, clientSalt).
     * This encoder applies a second Argon2id pass with a server-side pepper
     * before storing — ensuring DB breach alone does NOT expose passwords.
     *
     * Format stored: $argon2id$v=1$m=65536,t=3,p=4$<salt_b64>$<hash_b64>
     */
    @Bean
    public PasswordEncoder passwordEncoder(
            @Value("${security.argon2.memory-kb}") int memoryCost,
            @Value("${security.argon2.iterations}") int iterations,
            @Value("${security.argon2.parallelism}") int parallelism,
            @Value("${security.argon2.hash-length}") int hashLength,
            @Value("${security.argon2.salt-length}") int saltLength,
            @Value("${security.pepper}") String pepper) {

        return new PasswordEncoder() {
            private final SecureRandom random = new SecureRandom();

            @Override
            public String encode(CharSequence rawPassword) {
                byte[] salt = new byte[saltLength];
                random.nextBytes(salt);

                // Mix pepper with the incoming client hash
                String pepperedInput = rawPassword + pepper;

                Argon2Parameters params = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                    .withVersion(Argon2Parameters.ARGON2_VERSION_13)
                    .withSalt(salt)
                    .withMemoryAsKB(memoryCost)
                    .withIterations(iterations)
                    .withParallelism(parallelism)
                    .build();

                Argon2BytesGenerator generator = new Argon2BytesGenerator();
                generator.init(params);

                byte[] hash = new byte[hashLength];
                generator.generateBytes(pepperedInput.toCharArray(), hash);

                String saltB64 = Base64.getEncoder().encodeToString(salt);
                String hashB64 = Base64.getEncoder().encodeToString(hash);
                return String.format("$argon2id$v=1$m=%d,t=%d,p=%d$%s$%s",
                    memoryCost, iterations, parallelism, saltB64, hashB64);
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                try {
                    String[] parts = encodedPassword.split("\\$");
                    // parts: ["", "argon2id", "v=1", "m=...,t=...,p=...", saltB64, hashB64]
                    String[] costParts = parts[3].split(",");
                    int m = Integer.parseInt(costParts[0].split("=")[1]);
                    int t = Integer.parseInt(costParts[1].split("=")[1]);
                    int p = Integer.parseInt(costParts[2].split("=")[1]);
                    byte[] salt = Base64.getDecoder().decode(parts[4]);
                    byte[] expectedHash = Base64.getDecoder().decode(parts[5]);

                    String pepperedInput = rawPassword + pepper;

                    Argon2Parameters params = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                        .withVersion(Argon2Parameters.ARGON2_VERSION_13)
                        .withSalt(salt)
                        .withMemoryAsKB(m)
                        .withIterations(t)
                        .withParallelism(p)
                        .build();

                    Argon2BytesGenerator generator = new Argon2BytesGenerator();
                    generator.init(params);

                    byte[] actualHash = new byte[expectedHash.length];
                    generator.generateBytes(pepperedInput.toCharArray(), actualHash);

                    // Constant-time comparison
                    return java.security.MessageDigest.isEqual(actualHash, expectedHash);
                } catch (Exception e) {
                    return false;
                }
            }
        };
    }
}
