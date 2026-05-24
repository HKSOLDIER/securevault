package com.securevault.controller;

import com.securevault.dto.CredentialDtos;
import com.securevault.model.User;
import com.securevault.service.CredentialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/credentials")
@RequiredArgsConstructor
public class CredentialController {

    private final CredentialService credentialService;

    /**
     * GET /api/credentials
     * Returns all credentials belonging to the authenticated user (passwords decrypted).
     */
    @GetMapping
    public ResponseEntity<List<CredentialDtos.CredentialResponse>> getAll(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(credentialService.getAllForUser(user));
    }

    /**
     * POST /api/credentials
     * Body: { title, username, password, url, category, notes, emoji }
     */
    @PostMapping
    public ResponseEntity<CredentialDtos.CredentialResponse> create(
            @Valid @RequestBody CredentialDtos.CredentialRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(credentialService.create(request, user));
    }

    /**
     * PUT /api/credentials/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CredentialDtos.CredentialResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody CredentialDtos.CredentialRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(credentialService.update(id, request, user));
    }

    /**
     * DELETE /api/credentials/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        credentialService.delete(id, user);
        return ResponseEntity.noContent().build();
    }
}
