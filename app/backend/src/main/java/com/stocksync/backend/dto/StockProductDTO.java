package com.stocksync.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record StockProductDTO(
        @NotNull(message = "O ID do produto não pode ser nulo")
        Long productId,
        @NotNull(message = "A quantidade não pode ser nula")
        @Positive(message = "A quantidade deve ser um número positivo") Long quantity,
        @NotNull(message = "A quantidade mínima não pode ser nula")
        @Positive(message = "A quantidade mínima deve ser um número positivo")
        Long minimumQuantity
) {
}
