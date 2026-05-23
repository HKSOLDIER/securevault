package com.securevault.config;

import com.securevault.filter.JwtAuthFilter;
import com.securevault.filter.RateLimitFilter;
// import com.securevault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final RateLimitFilter rateLimitFilter;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    // private final UserRepository userRepository;

    // @Bean
    // public UserDetailsService userDetailsService() {
    //     return username -> userRepository.findByUsernameOrEmail(username, username)
    //         .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    // }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // ── Disable CSRF (stateless JWT API) ──────────────────────────
            .csrf(AbstractHttpConfigurer::disable)

            // ── CORS handled by CorsConfig bean ───────────────────────────
            .cors(cors -> cors.configurationSource(null)) // uses CorsConfig

            // ── Stateless session ─────────────────────────────────────────
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── Security headers ──────────────────────────────────────────
            .headers(headers -> {
                headers.contentSecurityPolicy(csp ->
                    csp.policyDirectives("default-src 'self'; frame-ancestors 'none'"));
                headers.referrerPolicy(ref ->
                    ref.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));
                headers.permissionsPolicy(p -> p.policy("geolocation=(), microphone=(), camera=()"));
                headers.frameOptions(frame -> frame.deny());
                headers.httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000));
            })

            // ── Route authorization ────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/auth/register",
                    "/auth/login",
                    "/auth/refresh",
                    "/actuator/health"
                ).permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )

            // ── Auth provider ──────────────────────────────────────────────
            .authenticationProvider(authenticationProvider())

            // ── Filters: rate limit → JWT ──────────────────────────────────
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    // @Bean
    // public UserDetailsService userDetailsService() {
    //     return username -> userRepository.findByUsernameOrEmail(username, username)
    //         .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    // }
}
