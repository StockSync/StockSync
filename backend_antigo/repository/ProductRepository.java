package com.stocksync.backend.repository;

import com.stocksync.backend.model.Product;
import com.stocksync.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // RF3.2.2: Busca global por nome ou SKU
    List<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(String name, String sku);

    // RF3.1.2: Garantir SKU único GLOBALMENTE
    Optional<Product> findBySku(String sku);
}