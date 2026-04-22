package com.pms.backend.dto;

public record AuthUserResponse(
        Long id,
        String name,
        String email
) {}