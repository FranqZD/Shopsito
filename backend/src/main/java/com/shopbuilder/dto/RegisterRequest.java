package com.shopbuilder.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
    @NotBlank String name,
    @Email @NotBlank String email,
    @Pattern(
        regexp = "^(?=.*\\d).{8,}$",
        message = "Password must be at least 8 characters and contain at least one digit"
    ) String password
) {
}
