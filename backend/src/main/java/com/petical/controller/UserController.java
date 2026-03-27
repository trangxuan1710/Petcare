package com.petical.controller;


import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.UserResponse;
import com.petical.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@Tag(name = "Người dùng", description = "API thông tin và tài nguyên người dùng")
public class UserController {
    private final UserService userService;

    @GetMapping(value = "/avatar/{id}", produces = MediaType.IMAGE_JPEG_VALUE)
    @Operation(summary = "Lấy ảnh đại diện", description = "Tải ảnh đại diện theo mã người dùng")
    public InputStreamResource downloadFile(@PathVariable("id") long id){
        return userService.getAvatar(id);
    }
    @GetMapping("/me")
    @Operation(summary = "Thông tin cá nhân", description = "Lấy thông tin người dùng đang đăng nhập")
    public ApiResponse<UserResponse> getUserInfo(){
        return ApiResponse.<UserResponse>builder().data(userService.getUserInfo()).build();
    }
}
