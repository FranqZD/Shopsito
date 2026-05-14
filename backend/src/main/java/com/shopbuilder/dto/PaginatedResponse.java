package com.shopbuilder.dto;

import java.util.List;

/**
 * Generic paginated response wrapper for list endpoints.
 */
public record PaginatedResponse<T>(
        List<T> content,
        int totalPages,
        long totalElements,
        int currentPage
) {
}
