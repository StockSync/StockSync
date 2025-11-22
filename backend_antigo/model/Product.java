package com.stocksync.backend.model;

import com.stocksync.backend.model.enuns.CatalogProductStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String name;

    @Column(name = "descricao", nullable = true, columnDefinition = "TEXT")
    private String description;

    @Column(name = "sku", nullable = true)
    private String sku;

    @Column(name = "imagem_url", nullable = true)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CatalogProductStatus status;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<StockProduct> stocks = new HashSet<>();
}

