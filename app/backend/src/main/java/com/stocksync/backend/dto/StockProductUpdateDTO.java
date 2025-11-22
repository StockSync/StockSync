package com.stocksync.backend.dto;

import com.stocksync.backend.model.enuns.ProductStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockProductUpdateDTO {

    @NotNull
    private Long productId;

    // Tipos Long, conforme sua entidade StockProduct
    @PositiveOrZero
    @NotNull
    private Long quantity;

    @PositiveOrZero
    @NotNull
    private Long minimumQuantity;

    @NotNull
    private ProductStatus productStatus;
}