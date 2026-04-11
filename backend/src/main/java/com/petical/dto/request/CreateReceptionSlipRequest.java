package com.petical.dto.request;

import com.petical.enums.ExamType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Schema(name = "CreateReceptionSlipRequest", description = "Payload tạo mới phiếu tiếp đón")
public class CreateReceptionSlipRequest {
    @NotNull
    @Schema(description = "Mã khách hàng", example = "1")
    private Long clientId;

    @NotNull
    @Schema(description = "Mã thú cưng", example = "2")
    private Long petId;

    @NotNull
    @Schema(description = "Mã lễ tân", example = "3")
    private Long receptionistId;

    @NotNull
    @Schema(description = "Mã bác sĩ phụ trách", example = "4")
    private Long doctorId;

    @Schema(description = "Mã form khám có sẵn (nếu tái sử dụng)", example = "10")
    private Long examFormId;

    @NotBlank
    @Schema(description = "Lý do khám", example = "Bỏ ăn, mệt")
    private String examReason;


    @Schema(description = "Lưu ý thêm", example = "Khó tiếp cận, cần giữ nhẹ")
    private String note;

    @NotNull
    @Schema(description = "Cân nặng (kg)", example = "4.2")
    private BigDecimal weight;

    @Schema(description = "Loại khám", implementation = ExamType.class)
    private ExamType examType;

    @Schema(description = "Đánh dấu ca cấp cứu", example = "false")
    private Boolean emergency;

    @Schema(description = "Thời điểm tiếp đón, để trống sẽ lấy thời gian hệ thống", example = "2026-03-31T09:30:00")
    private LocalDateTime receptionTime;
}