package com.stocksync.backend.dto;

import java.util.List;

public record DashboardDTO(
        long totalProducts,
        long activeProducts,
        long inactiveProducts,
        List<ProductDTO> products
) {
}
