package com.shopbuilder.repository;

import com.shopbuilder.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Product> findByCategoryName(String categoryName, Pageable pageable);

    Page<Product> findByNameContainingIgnoreCaseAndCategoryName(String name, String categoryName, Pageable pageable);

    Page<Product> findByCreatedById(Long userId, Pageable pageable);
}
