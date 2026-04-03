package com.petical.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(name = "AddExamPrescriptionItemRequest", description = "Thông tin 1 thuốc/vật tư trong đơn")
public class AddExamPrescriptionItemRequest {
    @NotNull
    @Schema(description = "Mã thuốc/vật tư", example = "12")
    private Long medicineId;

    @Min(1)
    @Schema(description = "Số lượng cấp phát (legacy)", example = "1")
    private Integer quantity;

    @Min(1)
    @Schema(description = "Số lượng bán ra (dùng tính hóa đơn)", example = "1")
    private Integer soldQuantity;

    @Min(0)
    @Schema(description = "Liều sáng", example = "1")
    private int morning;

    @Min(0)
    @Schema(description = "Liều trưa", example = "0")
    private int noon;

    @Min(0)
    @Schema(description = "Liều chiều", example = "1")
    private int afternoon;

    @Min(0)
    @Schema(description = "Liều tối", example = "0")
    private int evening;

    @Schema(description = "Chỉ định thêm", example = "Uống trước khi ăn")
    private String instruction;

    @Schema(description = "Đơn vị liều dùng", example = "Viên")
    private String dosageUnit;
}
