package com.petical.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thuốc/vật tư kỹ thuật viên sử dụng khi ghi nhận kết quả")
public class TechnicianUsedMedicineItemRequest {
    @Schema(example = "12")
    private Long medicineId;

    @Schema(example = "2")
    private Integer quantity;

    @Schema(example = "1")
    private Integer morning;

    @Schema(example = "0")
    private Integer noon;

    @Schema(example = "1")
    private Integer afternoon;

    @Schema(example = "0")
    private Integer evening;

    @Schema(example = "Dùng sau ăn")
    private String instruction;

    @Schema(example = "viên")
    private String dosageUnit;
}
