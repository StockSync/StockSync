package com.stocksync.backend.repository;

import com.stocksync.backend.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    // Método para encontrar todos os estoques de um usuário específico
    List<Stock> findByUserId(Long userId);
}