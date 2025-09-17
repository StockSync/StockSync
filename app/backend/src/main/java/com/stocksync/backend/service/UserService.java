package com.stocksync.backend.service;

import com.stocksync.backend.model.User;
import com.stocksync.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public User createUser(User user){
        return userRepository.save(user);
    }

}
