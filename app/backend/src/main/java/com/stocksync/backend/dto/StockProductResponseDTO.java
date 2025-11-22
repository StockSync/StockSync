package com.stocksync.backend.dto;

import com.stocksync.backend.model.Stock;
import com.stocksync.backend.model.StockProduct;

import java.util.List;
import java.util.stream.Collectors;

public record StockProductResponseDTO(
        Long stockId,
        String name,
        String location,
        String imageUrl,
        List<StockResponseDTO> products
)  {
    public StockProductResponseDTO(Stock stock) {
        this(
                stock.getId(),
                stock.getName(),
                stock.getLocation(),
                stock.getImageUrl(),
                stock.getProducts().stream()
                        .map(StockResponseDTO :: new) // Mapeia para o DTO aninhado
                        .collect(Collectors.toList())
        );
    }
}