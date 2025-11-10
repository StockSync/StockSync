package com.stocksync.backend.controller;

import com.stocksync.backend.dto.LoginRequestDTO;
import com.stocksync.backend.dto.RegisterRequestDTO;
import com.stocksync.backend.dto.ResponseDTO;
import com.stocksync.backend.infra.security.SecurityConfig;
import com.stocksync.backend.infra.security.TokenService;
import com.stocksync.backend.model.User;
import com.stocksync.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Controlador de autenticação de usuarios")
@SecurityRequirement(name = SecurityConfig.SECURITY)
public class AuthController {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @PostMapping("/login")
    @Operation(summary = "Login de usuario", description = "Metodo para Login de usuario")
    @ApiResponse(responseCode = "201", description = "Usuario logado com sucesso")
    @ApiResponse(responseCode = "400", description = "Email nao cadastrado")
    @ApiResponse(responseCode = "500", description = "Erro no servidor")
    public ResponseEntity login(@RequestBody LoginRequestDTO body){
        User user = this.repository.findByEmail(body.email()).orElseThrow(()-> new RuntimeException("User not found"));
        if(!passwordEncoder.matches(body.password(), user.getPassword())){
            return ResponseEntity.badRequest().build();
        }

        String token = this.tokenService.genereteToken(user);
        return ResponseEntity.ok(new ResponseDTO(user.getName(), token));
    }

    @PostMapping("/register")
    @Operation(summary = "Registro de usuario", description = "Metodo para registro de usuario")
    @ApiResponse(responseCode = "201", description = "Usuario gravado com sucesso")
    @ApiResponse(responseCode = "400", description = "Email cadastrado")
    @ApiResponse(responseCode = "500", description = "Erro no servidor")
    public ResponseEntity register(@RequestBody RegisterRequestDTO body){
        Optional<User> user = this.repository.findByEmail(body.email());
        if(user.isEmpty()) {
            User newUser = new User();
            newUser.setPassword(passwordEncoder.encode(body.password()));
            newUser.setEmail(body.email());
            newUser.setName(body.name());
            newUser.setCreationDate(LocalDate.now());
            this.repository.save(newUser);

            String token = this.tokenService.genereteToken(newUser);
            return ResponseEntity.ok(new ResponseDTO(newUser.getName(), token));

        }
        return ResponseEntity.badRequest().build();
    }
}
