package com.petical.mapper;

import com.petical.dto.response.UserResponse;
import com.petical.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse entityToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phoneNumber(user.getPhoneNumber())
                .build();
    }

}
