package com.stocksync.backend.service;
import com.stocksync.backend.dto.DashboardDTO;
import com.stocksync.backend.dto.ProductDTO;
import com.stocksync.backend.mapper.ProductMapper;
import com.stocksync.backend.model.StockProduct;
import com.stocksync.backend.model.User;
import com.stocksync.backend.model.enuns.CatalogProductStatus;
import com.stocksync.backend.repository.StockProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final StockProductRepository stockProductRepository;
    private final ProductMapper productMapper;

    public DashboardService(StockProductRepository stockProductRepository, ProductMapper productMapper) {
        this.stockProductRepository = stockProductRepository;
        this.productMapper = productMapper;
    }

    @Transactional(readOnly = true)
    public DashboardDTO getDashboardData(User user) {
        List<StockProduct> stockProducts = stockProductRepository.findByStockUser(user);

        long totalProducts = stockProducts.stream()
                .map(StockProduct::getProduct)
                .distinct()
                .count();

        long activeProducts = stockProducts.stream()
                .map(StockProduct::getProduct)
                .distinct()
                .filter(product -> product.getStatus() == CatalogProductStatus.ATIVO)
                .count();

        long inactiveProducts = totalProducts - activeProducts;

        List<ProductDTO> products = stockProducts.stream()
                .map(stockProduct -> productMapper.toDTO(stockProduct.getProduct()))
                .distinct()
                .collect(Collectors.toList());

        return new DashboardDTO(totalProducts, activeProducts, inactiveProducts, products);
    }
}
