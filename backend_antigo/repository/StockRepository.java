package com.stocksync.backend.repository;

import com.stocksync.backend.model.Stock;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    @EntityGraph(attributePaths = {"user", "products", "products.product"})
    List<Stock> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"products", "products.product"})
    Optional<Stock> findByIdFetchingProducts(Long stockId);
}