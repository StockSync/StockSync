package com.stocksync.backend.controller;

import com.stocksync.backend.dto.UserDTO;
import com.stocksync.backend.mapper.UserMapper;
import com.stocksync.backend.model.User;
import com.stocksync.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

     @GetMapping
     public ResponseEntity<String> getUser(){
        return ResponseEntity.ok("sucesso!");
     }
}
