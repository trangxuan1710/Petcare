package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@Schema(name = "TechnicianOptionResponse", description = "Thông tin kỹ thuật viên để chọn người thực hiện")
public class TechnicianOptionResponse {
    @Schema(description = "Mã kỹ thuật viên", example = "7")
    private long id;

    @Schema(description = "Họ tên", example = "Lê Huy Anh")
    private String fullName;

    @Schema(description = "Số điện thoại", example = "0912345678")
    private String phoneNumber;
}
