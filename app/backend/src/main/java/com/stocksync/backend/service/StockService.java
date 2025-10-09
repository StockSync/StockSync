package com.stocksync.backend.service;

import com.stocksync.backend.dto.StockDTO;
import com.stocksync.backend.dto.StockRequestDTO;
import com.stocksync.backend.exception.ResourceNotFoundException;
import com.stocksync.backend.model.*;
import com.stocksync.backend.model.enuns.ProductStatus;
import com.stocksync.backend.repository.ProductRepository;
import com.stocksync.backend.repository.StockRepository;
import com.stocksync.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StockService {

    private final ProductRepository productRepository;
    private final StockRepository stockRepository;


    public StockService(ProductRepository productRepository, StockRepository stockRepository) {
        this.productRepository = productRepository;
        this.stockRepository = stockRepository;
    }

    // Listar todos os estoques de um usuário (RF2.2)
    @Transactional(readOnly = true)
    public List<StockDTO> getAllStocksByUser(Long userId) {
        List<Stock> stocks = stockRepository.findByUserId(userId);
        return stocks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Buscar um estoque pelo ID
    @Transactional(readOnly = true)
    public StockDTO getStockById(Long stockId) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new RuntimeException("Estoque não encontrado com o ID: " + stockId));
        return convertToDTO(stock);
    }

    // Criar um novo estoque (RF2.1)
    @Transactional
    public StockDTO createStock(StockRequestDTO stockRequestDTO, User user) {
        Stock stock = new Stock();
        stock.setName(stockRequestDTO.name());
        stock.setLocation(stockRequestDTO.location());
        stock.setCreationDate(LocalDate.now());
        stock.setUser(user);

        Set<StockProduct> stockProducts = new HashSet<>();
        if (stockRequestDTO.products() != null && !stockRequestDTO.products().isEmpty()) {
            for (var productDTO : stockRequestDTO.products()) {
                Product product = productRepository.findById(productDTO.productId())
                        .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID: " + productDTO.productId()));

                StockProduct stockProduct = new StockProduct(
                        new StockProductId(stock.getId(), product.getId()),
                        product,
                        stock,
                        productDTO.quantity(),
                        productDTO.minimumQuantity(),
                        ProductStatus.IN_STOCK // ou um status padrão
                );
                stockProducts.add(stockProduct);
            }
        }

        stock.setProducts(stockProducts);
        Stock savedStock = stockRepository.save(stock);
        return convertToDTO(savedStock);
    }

    // Atualizar um estoque
    @Transactional
    public StockDTO updateStock(Long stockId, StockRequestDTO stockRequestDTO) {
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new RuntimeException("Estoque não encontrado com o ID: " + stockId));

        stock.setName(stockRequestDTO.name());
        stock.setLocation(stockRequestDTO.location());

        Stock updatedStock = stockRepository.save(stock);
        return convertToDTO(updatedStock);
    }
    // Deletar um estoque
    @Transactional
    public void deleteStock(Long stockId) {
        if (!stockRepository.existsById(stockId)) {
            throw new RuntimeException("Estoque não encontrado com o ID: " + stockId);
        }
        stockRepository.deleteById(stockId);
    }

    // Método utilitário para converter Entidade para DTO
    private StockDTO convertToDTO(Stock stock) {
        return new StockDTO(
                stock.getId(),
                stock.getName(),
                stock.getLocation(),
                stock.getUser().getId()
        );
    }
}
