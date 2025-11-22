package com.stocksync.backend.repository;

import com.stocksync.backend.model.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // ⬅️ IMPORTANTE
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // RF3.2.2: Busca global por nome ou SKU
    List<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(String name, String sku);

    // RF3.1.2: Garantir SKU único GLOBALMENTE
    Optional<Product> findBySku(String sku);

    // 🔑 CORRIGIDO: Método para listar todos com JOIN FETCH (via @Query)
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.stocks ps LEFT JOIN FETCH ps.stock")
    List<Product> retrieveAllProductsWithStockDetails();

    // 🔑 CORRIGIDO: Método para buscar por ID com JOIN FETCH (via @Query)
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.stocks ps LEFT JOIN FETCH ps.stock WHERE p.id = :id")
    Optional<Product> queryProductById(Long id);

    // NOTA: O nome dos métodos ('retrieveAllProductsWithStockDetails' e 'queryProductById')
    // já não importa mais, pois a anotação @Query assume o controle.
}