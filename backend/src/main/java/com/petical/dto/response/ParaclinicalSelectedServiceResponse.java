package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@Schema(name = "ParaclinicalSelectedServiceResponse", description = "Dịch vụ cận lâm sàng đã chọn cho phiếu khám")
public class ParaclinicalSelectedServiceResponse {
    @Schema(description = "Mã service order", example = "12")
    private long serviceOrderId;

    @Schema(description = "Mã dịch vụ", example = "2")
    private long serviceId;

    @Schema(description = "Tên dịch vụ", example = "Dịch vụ xét nghiệm UA")
    private String serviceName;

    @Schema(description = "Đơn giá", example = "120000")
    private BigDecimal unitPrice;

    @Schema(description = "Mã kỹ thuật viên", example = "7")
    private long technicianId;

    @Schema(description = "Tên kỹ thuật viên", example = "Lê Huy Anh")
    private String technicianName;

    @Schema(description = "Số lượt thực hiện", example = "1")
    private int quantity;
}
