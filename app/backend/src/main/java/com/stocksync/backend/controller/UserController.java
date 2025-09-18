package com.stocksync.backend.controller;

import com.stocksync.backend.dto.UserDTO;
import com.stocksync.backend.dto.UserUpdateDTO;
import com.stocksync.backend.infra.security.SecurityConfig;
import com.stocksync.backend.mapper.UserMapper;
import com.stocksync.backend.model.User;
import com.stocksync.backend.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@Tag(name = "Usuários", description = "Controlador de usuários")
@SecurityRequirement(name = SecurityConfig.SECURITY)
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    // Endpoint para buscar os dados do usuário logado
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getAuthenticatedUserProfile(@AuthenticationPrincipal User user){
        // O user já é injetado pelo Spring Security, basta convertê-lo para DTO
        return ResponseEntity.ok(userMapper.toDTO(user));
    }

    // Endpoint para atualizar o usuário logado
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateUser(
            @Valid @RequestBody UserUpdateDTO userUpdateDTO,
            @AuthenticationPrincipal User authenticatedUser) {

        // O ID do usuário a ser atualizado vem do token de autenticação
        UserDTO updatedUser = userService.updateUser(authenticatedUser.getId(), userUpdateDTO);
        return ResponseEntity.ok(updatedUser);
    }

    // Endpoint para deletar o usuário logado
    @DeleteMapping("/profile")
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal User authenticatedUser) {
        // O ID do usuário a ser deletado vem do token de autenticação
        userService.deleteUser(authenticatedUser.getId());
        return ResponseEntity.noContent().build();
    }
}
