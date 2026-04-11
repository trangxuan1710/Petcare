package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@Schema(description = "Thuốc/vật tư kỹ thuật viên đã ghi nhận")
public class TechnicianUsedMedicineItemResponse {
    @Schema(example = "12")
    private Long medicineId;

    @Schema(example = "Biotic")
    private String medicineName;

    @Schema(example = "Điều trị viêm loét dạ dày, rối loạn tiêu hóa")
    private String description;

    @Schema(example = "2")
    private int quantity;

    @Schema(example = "viên")
    private String dosageUnit;

    @Schema(example = "Dùng sau ăn")
    private String instruction;
}
