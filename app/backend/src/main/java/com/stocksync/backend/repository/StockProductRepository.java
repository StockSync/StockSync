package com.stocksync.backend.repository;


import com.stocksync.backend.model.Product;
import com.stocksync.backend.model.StockProduct;
import com.stocksync.backend.model.StockProductId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockProductRepository extends JpaRepository<StockProduct, StockProductId> {

    // Para RF3.4.2: Verificar se produto existe em algum estoque com quantidade > 0
    boolean existsByProductAndQuantityGreaterThan(Product product, Long quantity);
}
