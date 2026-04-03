package com.petical.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "ParaclinicalServiceSelectionItemRequest", description = "Thông tin 1 dịch vụ cận lâm sàng được chọn")
public class ParaclinicalServiceSelectionItemRequest {
    @NotNull
    @Schema(description = "Mã dịch vụ", example = "2")
    private Long serviceId;

    @NotNull
    @Schema(description = "Mã kỹ thuật viên thực hiện", example = "41")
    private Long technicianId;

    @Min(1)
    @Schema(description = "Số lượt thực hiện", example = "1")
    private int quantity = 1;
}
