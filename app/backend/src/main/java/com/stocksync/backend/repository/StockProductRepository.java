package com.stocksync.backend.repository;


import com.stocksync.backend.model.Product;
import com.stocksync.backend.model.StockProduct;
import com.stocksync.backend.model.StockProductId;
import com.stocksync.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockProductRepository extends JpaRepository<StockProduct, StockProductId> {

    // Para RF3.4.2: Verificar se produto existe em algum estoque com quantidade > 0
    boolean existsByProductAndQuantityGreaterThan(Product product, Long quantity);

    List<StockProduct> findByStockUser(User user);
}
