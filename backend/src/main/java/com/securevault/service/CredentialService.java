package com.securevault.service;

import com.securevault.dto.CredentialDtos;
import com.securevault.exception.AppExceptions;
import com.securevault.model.Credential;
import com.securevault.model.User;
import com.securevault.repository.CredentialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CredentialService {

    private final CredentialRepository credentialRepository;
    private final EncryptionService encryptionService;

    @Transactional(readOnly = true)
    public List<CredentialDtos.CredentialResponse> getAllForUser(User user) {
        return credentialRepository.findAllByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CredentialDtos.CredentialResponse create(CredentialDtos.CredentialRequest request, User user) {
        String encrypted = encryptionService.encrypt(request.getPassword());

        Credential credential = Credential.builder()
                .user(user)
                .title(request.getTitle())
                .username(request.getUsername())
                .encryptedPassword(encrypted)
                .url(request.getUrl())
                .category(request.getCategory())
                .notes(request.getNotes())
                .emoji(request.getEmoji())
                .build();

        credential = credentialRepository.save(credential);
        log.info("Credential '{}' created for user {}", credential.getTitle(), user.getEmail());
        return toResponse(credential);
    }

    @Transactional
    public CredentialDtos.CredentialResponse update(UUID id,
                                                     CredentialDtos.CredentialRequest request,
                                                     User user) {
        Credential credential = credentialRepository.findByIdAndUser(id, user)
                .orElseThrow(AppExceptions.CredentialNotFoundException::new);

        credential.setTitle(request.getTitle());
        credential.setUsername(request.getUsername());
        credential.setEncryptedPassword(encryptionService.encrypt(request.getPassword()));
        credential.setUrl(request.getUrl());
        credential.setCategory(request.getCategory());
        credential.setNotes(request.getNotes());
        credential.setEmoji(request.getEmoji());

        return toResponse(credentialRepository.save(credential));
    }

    @Transactional
    public void delete(UUID id, User user) {
        // Verify ownership before deletion
        credentialRepository.findByIdAndUser(id, user)
                .orElseThrow(AppExceptions.CredentialNotFoundException::new);
        credentialRepository.deleteByIdAndUser(id, user);
        log.info("Credential {} deleted for user {}", id, user.getEmail());
    }

    private CredentialDtos.CredentialResponse toResponse(Credential c) {
        CredentialDtos.CredentialResponse resp = new CredentialDtos.CredentialResponse();
        resp.setId(c.getId());
        resp.setTitle(c.getTitle());
        resp.setUsername(c.getUsername());
        resp.setPassword(encryptionService.decrypt(c.getEncryptedPassword()));
        resp.setUrl(c.getUrl());
        resp.setCategory(c.getCategory());
        resp.setNotes(c.getNotes());
        resp.setEmoji(c.getEmoji());
        resp.setCreatedAt(c.getCreatedAt());
        resp.setUpdatedAt(c.getUpdatedAt());
        return resp;
    }
}
