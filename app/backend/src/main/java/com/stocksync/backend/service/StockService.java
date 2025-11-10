package com.stocksync.backend.service;

import com.stocksync.backend.dto.StockDTO;
import com.stocksync.backend.dto.StockProductDTO;
import com.stocksync.backend.dto.StockRequestDTO;
import com.stocksync.backend.exception.BusinessRuleException;
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

    @Transactional
    public StockDTO addProductToStock(Long stockId, StockProductDTO productDTO, User user) {

        // 1. Encontrar o estoque
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Estoque não encontrado com o ID: " + stockId));

        // 2. Verificar permissão (o usuário logado é dono do estoque?)
        if (!stock.getUser().getId().equals(user.getId())) {
            throw new BusinessRuleException("Você não tem permissão para adicionar produtos a este estoque.");
        }

        // 3. Encontrar o produto no catálogo
        Product product = productRepository.findById(productDTO.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto do catálogo não encontrado com o ID: " + productDTO.productId()));

        // 4. Verificar se o produto JÁ EXISTE no estoque para evitar duplicatas
        boolean productExists = stock.getProducts().stream()
                .anyMatch(sp -> sp.getProduct().getId().equals(productDTO.productId()));

        if (productExists) {
            throw new BusinessRuleException("Este produto já existe neste estoque. Para alterar, use o endpoint de atualização de produto no estoque.");
        }

        // 5. Criar a nova entidade de associação StockProduct
        StockProduct stockProduct = new StockProduct(
                new StockProductId(stock.getId(), product.getId()),
                product,
                stock,
                productDTO.quantity(),
                productDTO.minimumQuantity(),
                ProductStatus.IN_STOCK // Define um status padrão ao adicionar
        );

        // 6. Adicionar ao set e salvar (o CascadeType.ALL salvará o novo StockProduct)
        stock.getProducts().add(stockProduct);
        Stock savedStock = stockRepository.save(stock);

        // 7. Retornar o DTO do estoque (padrão atual do seu serviço)
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
