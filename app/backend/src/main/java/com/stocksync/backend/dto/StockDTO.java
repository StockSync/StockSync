package com.stocksync.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record StockDTO(
        Long stockId,
        @NotBlank(message = "O nome do estoque não pode estar em branco")
        String name,
        String description,
        Long userId
) {
}