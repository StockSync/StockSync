package com.stocksync.backend.controller;

import com.stocksync.backend.infra.security.SecurityConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/uploads")
@Tag(name = "Upload", description = "Controlador de upload de arquivos")
@SecurityRequirement(name = SecurityConfig.SECURITY)
public class FileUploadController {

    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload de imagem")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("🔵 Iniciando upload...");
            System.out.println("📝 Nome do arquivo: " + file.getOriginalFilename());
            System.out.println("📏 Tamanho: " + file.getSize() + " bytes");

            // 1. Validar se é uma imagem
            String contentType = file.getContentType();
            System.out.println("📄 Content-Type: " + contentType);

            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Arquivo deve ser uma imagem");
                return ResponseEntity.badRequest().body(error);
            }

            // 2. Validar tamanho (máximo 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Imagem muito grande. Máximo 5MB");
                return ResponseEntity.badRequest().body(error);
            }

            // 3. Gerar nome único para o arquivo
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;
            System.out.println("🆕 Novo nome: " + newFilename);

            // 4. Criar diretório se não existir
            Path uploadPath = Paths.get(UPLOAD_DIR);
            System.out.println("📂 Caminho da pasta: " + uploadPath.toAbsolutePath());

            if (!Files.exists(uploadPath)) {
                System.out.println("⚠️ Pasta não existe, criando...");
                Files.createDirectories(uploadPath);
                System.out.println("✅ Pasta criada!");
            } else {
                System.out.println("✅ Pasta já existe!");
            }

            // 5. Salvar arquivo
            Path filePath = uploadPath.resolve(newFilename);
            System.out.println("💾 Salvando em: " + filePath.toAbsolutePath());

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("🎉 Arquivo salvo com sucesso!");
            System.out.println("🔍 Arquivo existe? " + Files.exists(filePath));
            System.out.println("📊 Tamanho no disco: " + Files.size(filePath) + " bytes");

            // 6. Retornar URL da imagem
            String imageUrl = "/uploads/" + newFilename;

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            response.put("message", "Upload realizado com sucesso");

            System.out.println("✅ Imagem salva: " + imageUrl);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("❌ ERRO: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Erro ao fazer upload: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}