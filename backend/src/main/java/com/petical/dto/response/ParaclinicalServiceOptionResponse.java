package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@Schema(name = "ParaclinicalServiceOptionResponse", description = "Thông tin dịch vụ cận lâm sàng để chọn")
public class ParaclinicalServiceOptionResponse {
    @Schema(description = "Mã dịch vụ", example = "2")
    private long serviceId;

    @Schema(description = "Tên dịch vụ", example = "Dịch vụ xét nghiệm UA")
    private String serviceName;

    @Schema(description = "Đơn giá", example = "120000")
    private BigDecimal unitPrice;
}
