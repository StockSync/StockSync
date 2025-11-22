package com.stocksync.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record UserDTO(
        Long id,

        @NotBlank(message = "O nome nao pode estar em branco")
        String name,

        @NotBlank(message = "O email nao pode estar em branco")
        String email,

        @NotNull
        String password,

        @PastOrPresent(message = "A data de criacao deve ser ouno passado ou no presente")
        LocalDate creationDate) {
}
