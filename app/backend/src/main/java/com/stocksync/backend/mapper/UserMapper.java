package com.stocksync.backend.mapper;

import com.stocksync.backend.dto.UserDTO;
import com.stocksync.backend.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDTO (User user){
        if (user == null){
            return null;
        }
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPassword(),
                user.getCreationDate()
        );
    }

    public User toEntity(UserDTO userDTO){
        if (userDTO == null){
            return null;
        }
        User user = new User();
        user.setId(userDTO.id());
        user.setName(userDTO.name());
        user.setEmail(userDTO.email());
        user.setPassword(userDTO.password());
        user.setCreationDate(userDTO.creationDate());
        return user;
    }

}
