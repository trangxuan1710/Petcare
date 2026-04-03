package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@Schema(name = "AddExamPrescriptionResponse", description = "Kết quả thêm đơn thuốc cho phiếu khám")
public class AddExamPrescriptionResponse {
    @Schema(description = "Mã đơn thuốc", example = "18")
    private long prescriptionId;

    @Schema(description = "Mã kết quả khám", example = "35")
    private long examResultId;

    @Schema(description = "Số dòng thuốc vừa thêm", example = "3")
    private int addedItemCount;
}
