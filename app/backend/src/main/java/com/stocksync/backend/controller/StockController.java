package com.stocksync.backend.controller;

import com.stocksync.backend.dto.StockDTO;
import com.stocksync.backend.dto.StockProductDTO;
import com.stocksync.backend.dto.StockRequestDTO;
import com.stocksync.backend.infra.security.SecurityConfig;
import com.stocksync.backend.model.User;
import com.stocksync.backend.service.StockService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stocks")
@Tag(name = "Estoques", description = "Controlador de estoques")
@SecurityRequirement(name = SecurityConfig.SECURITY)
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    // Endpoint para criar um novo estoque (RF2.1)
    @PostMapping
    public ResponseEntity<StockDTO> createStock(@Valid @RequestBody StockRequestDTO stockRequestDTO, @AuthenticationPrincipal User user) {
        StockDTO createdStock = stockService.createStock(stockRequestDTO, user);
        return new ResponseEntity<>(createdStock, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/products")
    public ResponseEntity<StockDTO> addProductToStock(
            @PathVariable("id") Long stockId,
            @Valid @RequestBody StockProductDTO productDTO,
            @AuthenticationPrincipal User user) {

        StockDTO updatedStock = stockService.addProductToStock(stockId, productDTO, user);

        // Retorna 201 CREATED com o DTO do estoque atualizado (seguindo seu padrão do createStock)
        return new ResponseEntity<>(updatedStock, HttpStatus.CREATED);
    }

    // Endpoint para listar todos os estoques do usuário logado (RF2.2)
    @GetMapping
    public ResponseEntity<List<StockDTO>> getAllStocksByUser(@AuthenticationPrincipal User user) {
        List<StockDTO> stocks = stockService.getAllStocksByUser(user.getId());
        return ResponseEntity.ok(stocks);
    }

    // Endpoint para buscar um estoque pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<StockDTO> getStockById(@PathVariable("id") Long stockId) {
        StockDTO stock = stockService.getStockById(stockId);
        return ResponseEntity.ok(stock);
    }

    // Endpoint para atualizar um estoque
    @PutMapping("/{id}")
    public ResponseEntity<StockDTO> updateStock(@PathVariable("id") Long stockId, @Valid @RequestBody StockRequestDTO stockRequestDTO) {
        StockDTO updatedStock = stockService.updateStock(stockId, stockRequestDTO);
        return ResponseEntity.ok(updatedStock);
    }
    // Endpoint para deletar um estoque
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStock(@PathVariable("id") Long stockId) {
        stockService.deleteStock(stockId);
        return ResponseEntity.noContent().build();
    }
}

