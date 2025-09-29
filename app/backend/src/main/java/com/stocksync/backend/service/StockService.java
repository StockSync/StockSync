package com.stocksync.backend.service;

import com.stocksync.backend.dto.StockDTO;
import com.stocksync.backend.dto.StockRequestDTO;
import com.stocksync.backend.model.Stock;
import com.stocksync.backend.model.User;
import com.stocksync.backend.repository.StockRepository;
import com.stocksync.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockService {

    private final StockRepository stockRepository;
    private final UserRepository userRepository;

    public StockService(StockRepository stockRepository, UserRepository userRepository) {
        this.stockRepository = stockRepository;
        this.userRepository = userRepository;
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
        // Não é mais necessário buscar o usuário, ele já vem do contexto de segurança
        Stock stock = new Stock();
        stock.setName(stockRequestDTO.name());
        stock.setLocation(stockRequestDTO.location());
        stock.setCreationDate(LocalDate.now());
        stock.setUser(user);

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
