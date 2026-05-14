package com.shopbuilder.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * DTO representing a product in API responses.
 */
public record ProductDto(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer stock,
        String imageUrl,
        String category,
        Long categoryId,
        Long createdBy,
        Instant createdAt
) {
}
