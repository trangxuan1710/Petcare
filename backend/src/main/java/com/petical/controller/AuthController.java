package com.petical.controller;


import com.petical.dto.request.LoginRequest;
import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.TokenResponse;
import com.petical.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Xác thực", description = "API đăng nhập và đăng xuất")
public class AuthController {
    private final UserService userService;

    @PostMapping("/public/login")
    @Operation(
            summary = "Đăng nhập",
            description = "Đăng nhập bằng số điện thoại và mật khẩu để lấy JWT",
            security = {}
    )
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest req){
        return ApiResponse.<TokenResponse>builder().data(userService.login(req)).build();
    }

    @DeleteMapping("/logout")
    @Operation(summary = "Đăng xuất", description = "Thu hồi token hiện tại và kết thúc phiên đăng nhập")
    public ApiResponse<Void> logout(@RequestHeader("Authorization") String token){
        userService.logout(token.substring(7));
        return ApiResponse.<Void>builder().build();
    }
}
