package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@Schema(name = "PetExamHistoryMedicineResponse", description = "Thông tin thuốc/vật tư trong một mốc khám")
public class PetExamHistoryMedicineResponse {
    @Schema(description = "Mã thuốc", example = "11")
    private long medicineId;
    @Schema(description = "Tên thuốc", example = "Buspiron HCl")
    private String medicineName;
    @Schema(description = "Mô tả thuốc", example = "Giảm co thắt và hỗ trợ tiêu hóa")
    private String description;
    @Schema(description = "Số lượng", example = "2")
    private int quantity;
    @Schema(description = "Đơn vị", example = "viên")
    private String unit;
    @Schema(description = "Liều dùng", example = "2 viên sáng - tối")
    private String dosage;
}