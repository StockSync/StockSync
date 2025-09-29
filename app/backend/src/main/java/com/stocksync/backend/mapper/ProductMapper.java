package com.stocksync.backend.mapper;

import com.stocksync.backend.dto.ProductDTO;
import com.stocksync.backend.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDTO toDTO(Product product) {
        if (product == null) {
            return null;
        }
        return new ProductDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getSku(),
                product.getImageUrl(),
                product.getStatus() // Mapeando o status correto
        );
    }

    // Não vamos mapear para entidade a partir do DTO de resposta.
    // A lógica de criação/atualização será feita no serviço para maior controle.
}
