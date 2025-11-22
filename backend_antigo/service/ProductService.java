package com.stocksync.backend.service;

import com.stocksync.backend.dto.ProductDTO;
import com.stocksync.backend.dto.ProductRequestDTO;
import com.stocksync.backend.exception.BusinessRuleException;
import com.stocksync.backend.exception.ResourceNotFoundException;
import com.stocksync.backend.mapper.ProductMapper;
import com.stocksync.backend.model.Product;
import com.stocksync.backend.repository.ProductRepository;
import com.stocksync.backend.repository.StockProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StockProductRepository stockProductRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository, StockProductRepository stockProductRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.stockProductRepository = stockProductRepository;
        this.productMapper = productMapper;
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts(String searchTerm) {
        List<Product> products;
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(searchTerm, searchTerm);
        } else {
            products = productRepository.findAll();
        }
        return products.stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID: " + productId));
        return productMapper.toDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductRequestDTO productRequestDTO) {
        // RF3.1.2: Validação de SKU único global
        if (productRequestDTO.sku() != null && !productRequestDTO.sku().isEmpty()) {
            productRepository.findBySku(productRequestDTO.sku()).ifPresent(p -> {
                throw new BusinessRuleException("SKU '" + productRequestDTO.sku() + "' já existe no catálogo.");
            });
        }

        Product product = new Product();
        product.setName(productRequestDTO.name());
        product.setDescription(productRequestDTO.description());
        product.setSku(productRequestDTO.sku());
        product.setImageUrl(productRequestDTO.imageUrl());
        product.setStatus(productRequestDTO.status());

        Product savedProduct = productRepository.save(product);
        return productMapper.toDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProduct(Long productId, ProductRequestDTO productRequestDTO) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID: " + productId));

        // Validação de SKU único (ignorando o próprio produto)
        if (productRequestDTO.sku() != null && !productRequestDTO.sku().isEmpty()) {
            productRepository.findBySku(productRequestDTO.sku()).ifPresent(existingProduct -> {
                if (!existingProduct.getId().equals(productId)) {
                    throw new BusinessRuleException("SKU '" + productRequestDTO.sku() + "' já pertence a outro produto.");
                }
            });
        }

        product.setName(productRequestDTO.name());
        product.setDescription(productRequestDTO.description());
        product.setSku(productRequestDTO.sku());
        product.setImageUrl(productRequestDTO.imageUrl());
        product.setStatus(productRequestDTO.status());

        Product updatedProduct = productRepository.save(product);
        return productMapper.toDTO(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID: " + productId));

        // RF3.4.2: Regra de Negócio Crítica (esta regra continua perfeita)
        boolean inStock = stockProductRepository.existsByProductAndQuantityGreaterThan(product, 0L);
        if (inStock) {
            throw new BusinessRuleException("Não é possível remover o produto, pois ele está associado a um estoque com quantidade maior que zero.");
        }

        productRepository.delete(product);
    }
}