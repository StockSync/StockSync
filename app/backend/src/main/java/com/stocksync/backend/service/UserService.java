package com.stocksync.backend.service;

import com.stocksync.backend.dto.UserDTO;
import com.stocksync.backend.dto.UserUpdateDTO;
import com.stocksync.backend.mapper.UserMapper;
import com.stocksync.backend.model.User;
import com.stocksync.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper; // Injete o mapper

    // O método createUser pode ser mantido ou removido,
    // já que a lógica principal está no AuthController
    @Transactional
    public User createUser(User user){
        return userRepository.save(user);
    }

    // --- NOVOS MÉTODOS DO CRUD ---

    // Buscar usuário pelo ID
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o ID: " + userId));
        return userMapper.toDTO(user);
    }

    // Atualizar um usuário
    @Transactional
    public UserDTO updateUser(Long userId, UserUpdateDTO userUpdateDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o ID: " + userId));

        user.setName(userUpdateDTO.name());
        user.setEmail(userUpdateDTO.email());

        if (userUpdateDTO.imageUrl() != null) {
            user.setImageUrl(userUpdateDTO.imageUrl());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toDTO(updatedUser);
    }

    // Deletar um usuário
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Usuário não encontrado com o ID: " + userId);
        }
        userRepository.deleteById(userId);
    }
}
