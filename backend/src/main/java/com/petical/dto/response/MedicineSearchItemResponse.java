package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@Schema(name = "MedicineSearchItemResponse", description = "Thông tin thuốc/vật tư để chọn nhanh")
public class MedicineSearchItemResponse {
    @Schema(description = "Mã thuốc", example = "12")
    private long id;

    @Schema(description = "Tên thuốc", example = "Đài Tràng Trường Phúc")
    private String name;

    @Schema(description = "Mô tả ngắn", example = "Điều trị viêm loét dạ dày, rối loạn tiêu hóa")
    private String description;

    @Schema(description = "Đơn vị", example = "hộp")
    private String unit;

    @Schema(description = "Giá", example = "120000")
    private BigDecimal price;

    @Schema(description = "Giá theo đơn vị", example = "12000")
    private BigDecimal unitPrice;

    @Schema(description = "Giá theo hộp", example = "96000")
    private BigDecimal boxPrice;

    @Schema(description = "Số lượng tồn", example = "2")
    private int stockQuantity;

    @Schema(description = "Loại thuốc/vật tư", example = "thuốc")
    private String type;
}
