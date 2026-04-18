package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@Schema(description = "Thuốc/vật tư kỹ thuật viên đã ghi nhận")
public class TechnicianUsedMedicineItemResponse {
    @Schema(example = "1")
    private Long serviceId;

    @Schema(example = "Khám lâm sàng")
    private String serviceName;

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

    @Schema(example = "120000", description = "Giá bán theo 1 hộp (unitPrice * quantityPerBox)")
    private BigDecimal price;

    @Schema(example = "Dùng sau ăn")
    private String instruction;

    @Schema(example = "VAT_TU", description = "Loại sản phẩm: THUOC hoặc VAT_TU")
    private String productType;
}
