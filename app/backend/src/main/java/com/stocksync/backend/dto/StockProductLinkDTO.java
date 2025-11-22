// StockProductLinkDTO.java
package com.stocksync.backend.dto;

public record StockProductLinkDTO(
        Long stockId,
        String stockName,
        Long quantity,
        Long minimumQuantity
        // Note que ProductStatus.IN_STOCK pode ser opcional aqui
) {
}