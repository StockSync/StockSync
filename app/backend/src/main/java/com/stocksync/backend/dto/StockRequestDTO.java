package com.stocksync.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record StockRequestDTO(
        @NotBlank(message = "O nome do estoque não pode estar em branco")
        String name,
        String location
) {
}
