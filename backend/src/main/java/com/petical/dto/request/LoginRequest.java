package com.petical.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "LoginRequest", description = "Thông tin đăng nhập")
public class LoginRequest {
    @Schema(description = "Số điện thoại đăng nhập", example = "0901000000")
    private String phoneNumber;

    @Schema(description = "Mật khẩu", example = "123456")
    private String password;
}
