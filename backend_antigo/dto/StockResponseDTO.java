package com.stocksync.backend.dto;

import com.stocksync.backend.model.StockProduct;

public record StockResponseDTO(
        String productName,
        Long quantity
) {
    public StockResponseDTO(StockProduct stockProduct) {
    this(
            stockProduct.getProduct().getName(), // Pega o NOME do produto
            stockProduct.getQuantity()           // Pega a QUANTIDADE da relação
    );
}}
