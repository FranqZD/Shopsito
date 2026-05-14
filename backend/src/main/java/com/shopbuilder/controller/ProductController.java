package com.shopbuilder.controller;

import com.shopbuilder.dto.CreateProductRequest;
import com.shopbuilder.dto.PaginatedResponse;
import com.shopbuilder.dto.ProductDto;
import com.shopbuilder.dto.UpdateProductRequest;
import com.shopbuilder.service.ProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller for product management endpoints.
 *
 * <p>Public endpoints (no auth required):
 * <ul>
 *   <li>GET /api/products — paginated list with optional search and category filter</li>
 *   <li>GET /api/products/{id} — single product detail</li>
 * </ul>
 *
 * <p>Authenticated seller endpoints:
 * <ul>
 *   <li>POST /api/products — create product (multipart/form-data)</li>
 *   <li>PUT /api/products/{id} — update product (multipart/form-data, owner only)</li>
 *   <li>DELETE /api/products/{id} — delete product (owner only)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * GET /api/products
     *
     * Returns a paginated list of products. Supports optional filtering by search term
     * (case-insensitive partial name match) and/or category name.
     *
     * @param page     zero-based page index (default 0)
     * @param size     page size, maximum 100 (default 12)
     * @param search   optional case-insensitive partial name filter (max 255 chars)
     * @param category optional category name filter
     * @return paginated product list
     */
    @GetMapping
    public ResponseEntity<PaginatedResponse<ProductDto>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") @Max(100) int size,
            @RequestParam(required = false) @Size(max = 255) String search,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(productService.getProducts(page, size, search, category));
    }

    /**
     * GET /api/products/{id}
     *
     * Returns the full details of a single product. Returns 404 if the product does not exist.
     *
     * @param id product identifier
     * @return product DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    /**
     * POST /api/products
     *
     * Creates a new product associated with the authenticated seller.
     * Accepts multipart/form-data with a "product" part (JSON) and an optional "image" file part.
     *
     * @param request     validated product creation data
     * @param image       optional image file (JPEG, PNG, or WebP, max 5 MB)
     * @param userDetails authenticated seller principal
     * @return created product DTO with HTTP 201
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> createProduct(
            @Valid @RequestPart("product") CreateProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) {
        ProductDto created = productService.createProduct(request, image, userDetails.getUsername());
        return ResponseEntity.status(201).body(created);
    }

    /**
     * PUT /api/products/{id}
     *
     * Updates an existing product. Only the seller who created the product may update it;
     * any other authenticated user receives a 403 response.
     * Accepts multipart/form-data with a "product" part (JSON) and an optional "image" file part.
     *
     * @param id          product identifier
     * @param request     validated product update data
     * @param image       optional replacement image file (JPEG, PNG, or WebP, max 5 MB)
     * @param userDetails authenticated seller principal
     * @return updated product DTO
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestPart("product") UpdateProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(productService.updateProduct(id, request, image, userDetails.getUsername()));
    }

    /**
     * DELETE /api/products/{id}
     *
     * Deletes a product and its associated image from storage. Only the seller who created
     * the product may delete it; any other authenticated user receives a 403 response.
     *
     * @param id          product identifier
     * @param userDetails authenticated seller principal
     * @return HTTP 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        productService.deleteProduct(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
