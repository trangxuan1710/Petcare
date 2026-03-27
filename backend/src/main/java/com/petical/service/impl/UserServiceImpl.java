package com.petical.service.impl;

import com.petical.common.Cache;
import com.petical.common.util.JwtUtil;
import com.petical.dto.request.LoginRequest;
import com.petical.dto.response.TokenResponse;
import com.petical.dto.response.UserResponse;
import com.petical.entity.User;
import com.petical.enums.ErrorCode;
import com.petical.errors.AppException;
import com.petical.mapper.UserMapper;
import com.petical.repository.UserRepository;
import com.petical.service.UserService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.Date;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final Cache cache;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    @Override
    public TokenResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByPhoneNumber(loginRequest.getPhoneNumber());
        log.info(loginRequest.getPhoneNumber());
        if(user==null) {
            throw new AppException(ErrorCode.LOGIN_FAIL);
        }
        if(!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.LOGIN_FAIL);
        }
        return TokenResponse.builder().token(jwtUtil.generateToken(user))
                .user(userMapper.entityToUserResponse(user))
                .build();
    }
    @Override
    public void logout(String token) {
        Claims claims = jwtUtil.getClaims(token);
        Date now = new Date();
        if(now.before(claims.getExpiration())) {
            cache.add(claims.getId(), token,  claims.getExpiration().getTime()-now.getTime());
        }
    }
    @Override
    public InputStreamResource getAvatar(Long id) {
        User user = userRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND));
        File file = new File(user.getAvatarPath());
        try {
            FileInputStream fis = new FileInputStream(file);
            return new InputStreamResource(fis);
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public UserResponse getUserInfo() {
        User u = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userMapper.entityToUserResponse(u);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByPhoneNumber(username);
        return user;
    }
}
