package com.securevault.repository;

import com.securevault.model.Credential;
import com.securevault.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CredentialRepository extends JpaRepository<Credential, UUID> {
    List<Credential> findAllByUserOrderByCreatedAtDesc(User user);
    Optional<Credential> findByIdAndUser(UUID id, User user);
    void deleteByIdAndUser(UUID id, User user);
}
