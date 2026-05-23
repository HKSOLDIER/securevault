package com.securevault.dto;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private UUID id;
    private String username;
    private String email;
    private String role;
    private boolean emailVerified;
    private OffsetDateTime lastLoginAt;
    private OffsetDateTime createdAt;
}
