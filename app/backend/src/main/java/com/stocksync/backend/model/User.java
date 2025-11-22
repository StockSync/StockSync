package com.stocksync.backend.model;

import com.stocksync.backend.model.enuns.Role; // 🔑 Importa o Enum que você criou
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority; // Import de segurança
import org.springframework.security.core.authority.SimpleGrantedAuthority; // Import de segurança
import org.springframework.security.core.userdetails.UserDetails; // 🔑 Importa a interface principal

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection; // Import de Coleção
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "Usuarios")
@Getter
@Setter
@NoArgsConstructor
// 💡 AGORA IMPLEMENTA A INTERFACE DE SEGURANÇA
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "senha", nullable = false)
    private String password; // Já tem!

    @Column(name = "data_criacao", nullable = false)
    private LocalDate creationDate;

    @Column(name = "imagem_url", nullable = true)
    private String imageUrl;

    // 🔑 NOVO CAMPO: Coleção de Roles (Mapeamento JPA)
    @ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "tb_user_role", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private List<Role> roles;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Stock> stocks = new ArrayList<>();

    // Construtor existente
    public User(String name, String email, String password, LocalDate creationDate) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.creationDate = creationDate;
    }


    // =========================================================
    // 🔑 MÉTODOS OBRIGATÓRIOS DO USERDETAILS (para Spring Security)
    // =========================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Mapeia Role.USER para a string "ROLE_USER" que o Spring exige
        return this.roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getUsername() {
        return email; // Usa o email como nome de usuário para o login
    }

    // Métodos de status da conta - deixamos como true por padrão
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}