package com.securevault.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securevault.dto.ErrorResponse;
import io.github.bucket4j.*;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> loginBuckets    = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    @Value("${security.rate-limit.login-capacity}")
    private int loginCapacity;
    @Value("${security.rate-limit.login-refill-minutes}")
    private int loginRefillMinutes;
    @Value("${security.rate-limit.register-capacity}")
    private int registerCapacity;
    @Value("${security.rate-limit.register-refill-hours}")
    private int registerRefillHours;

    public RateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        String ip   = getClientIp(request);

        Bucket bucket = null;

        if (path.equals("/auth/login")) {
            bucket = loginBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                    .addLimit(Bandwidth.builder()
                        .capacity(loginCapacity)
                        .refillGreedy(loginCapacity, Duration.ofMinutes(loginRefillMinutes))
                        .build())
                    .build());
        } else if (path.equals("/auth/register")) {
            bucket = registerBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                    .addLimit(Bandwidth.builder()
                        .capacity(registerCapacity)
                        .refillGreedy(registerCapacity, Duration.ofHours(registerRefillHours))
                        .build())
                    .build());
        }

        if (bucket != null && !bucket.tryConsume(1)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", "60");
            objectMapper.writeValue(response.getWriter(),
                ErrorResponse.of(429, "Too Many Requests",
                    "Rate limit exceeded. Please wait before trying again."));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim()
                                                : request.getRemoteAddr();
    }
}
