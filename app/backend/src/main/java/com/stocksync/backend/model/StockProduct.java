package com.stocksync.backend.model;

import com.stocksync.backend.model.enuns.ProductStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "")
public class StockProduct {

    @EmbeddedId
    private StockProductId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("stockId")
    @JoinColumn(name = "stock_id")
    private Stock stock;

    @Column (name = "quantidade_atual", nullable = false)
    private Long quantity;

    @Column(name = "quantidade_minima", nullable = false)
    private Long minimumQuantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_produto", nullable = false)
    private ProductStatus productStatus;

    public StockProduct(StockProductId id, Product product, Stock stock, Long quantity, Long minimumQuantity, ProductStatus productStatus) {
        this.id = id;
        this.product = product;
        this.stock = stock;
        this.quantity = quantity;
        this.minimumQuantity = minimumQuantity;
        this.productStatus = productStatus;
    }
}
