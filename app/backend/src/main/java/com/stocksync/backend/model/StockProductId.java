package com.stocksync.backend.model;

import java.util.Objects;

public class StockProductId {
    private Long stockId;
    private Long productId;

    public StockProductId() {
    }

    public StockProductId(Long stockId, Long productId) {
        this.stockId = stockId;
        this.productId = productId;
    }

    public Long getStockId() {
        return stockId;
    }

    public void setStockId(Long stockId) {
        this.stockId = stockId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StockProductId that = (StockProductId) o;
        return Objects.equals(stockId, that.stockId) && Objects.equals(productId, that.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(stockId, productId);
    }
}

