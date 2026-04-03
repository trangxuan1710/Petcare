package com.petical.service;


import com.petical.dto.request.LoginRequest;
import com.petical.dto.response.TokenResponse;
import com.petical.dto.response.UserResponse;
import org.springframework.core.io.InputStreamResource;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public interface UserService extends UserDetailsService {
    TokenResponse login( LoginRequest loginRequest);
    void logout(String token);
    InputStreamResource getAvatar(Long id);
    UserResponse getUserInfo();
}
