package com.shopbuilder.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/**
 * Request DTO for updating an existing product.
 */
public record UpdateProductRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 2000) String description,
        @NotNull @DecimalMin("0.01") @DecimalMax("999999999.99") BigDecimal price,
        @NotNull @Min(0) @Max(999999) Integer stock,
        @NotNull Long categoryId,
        String imageUrl
) {
}
