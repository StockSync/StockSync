package com.stocksync.backend.dto;

import com.stocksync.backend.model.enuns.CatalogProductStatus;

public record ProductDTO(
        Long id,
        String name,
        String description,
        String sku,
        String imageUrl,
        CatalogProductStatus status
) {
}
