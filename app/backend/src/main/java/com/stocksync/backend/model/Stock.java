package com.stocksync.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "estoque")
@Getter
@Setter
@NoArgsConstructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String name;

    @Column(name = "descricao", nullable = true)
    private String description;

    @Column(name = "data_criacao", nullable = false)
    private LocalDate creationDate;

    @Column(name = "imagem_url", nullable = true)
    private LocalDate imageUrl;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private User user;


    @OneToMany(mappedBy = "stock", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<StockProduct> products = new HashSet<>();

}
