package com.petical.dto.request;

import com.petical.enums.ReceptionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Schema(name = "UpdateReceptionSlipRequest", description = "Payload cập nhật phiếu tiếp đón")
public class UpdateReceptionSlipRequest {
    @Schema(description = "Lý do khám", example = "Co giật, thở yếu")
    private String examReason;

    @Schema(description = "Mô tả triệu chứng", example = "Mệt, bỏ ăn")
    private String symptomDescription;

    @Schema(description = "Lưu ý", example = "Ưu tiên xử lý nhanh")
    private String note;

    @Schema(description = "Trạng thái phiếu", implementation = ReceptionStatus.class)
    private ReceptionStatus status;

    @Schema(description = "Cân nặng (kg)", example = "4.5")
    private BigDecimal weight;

    @Schema(description = "Đổi bác sĩ phụ trách", example = "4")
    private Long doctorId;
}