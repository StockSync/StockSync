package com.stocksync.backend.dto;

import com.stocksync.backend.model.enuns.CatalogProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductRequestDTO(
        @NotBlank(message = "O nome do produto não pode estar em branco")
        String name,

        String description,
        String sku,
        String imageUrl,
        CatalogProductStatus status
) {
}