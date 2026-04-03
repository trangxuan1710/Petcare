package com.petical.dto.request;

import com.petical.enums.TreatmentDecision;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Schema(name = "RecordExamResultRequest", description = "Payload ghi nhận kết quả khám cho phiếu tiếp đón")
public class RecordExamResultRequest {
    @Schema(description = "Mã bác sĩ khám, để trống sẽ dùng bác sĩ trên phiếu tiếp đón", example = "1")
    private Long doctorId;

    @Schema(description = "Mã hướng điều trị", example = "1")
    private Long treatmentDirectionId;

        @Schema(
            description = "Quyết định điều trị (ưu tiên dùng field này). Hỗ trợ cả enum key và tiếng Việt",
            allowableValues = {
                "DISCHARGE",
                "INPATIENT_TREATMENT",
                "OUTPATIENT_TREATMENT",
                "PARACLINICAL_EXAM",
                "cho về",
                "điều trị nội trú",
                "điều trị ngoại trú",
                "khám cận lâm sàng"
            },
            example = "DISCHARGE"
        )
    private TreatmentDecision treatmentDecision;

    @Schema(description = "Tên hướng điều trị (tự tạo nếu chưa có)", example = "Cho về theo dõi")
    private String treatmentDirectionName;

    @Schema(description = "Kết luận chung", example = "Hô hấp nhẹ, chỉ định cận lâm sàng")
    private String conclusion;

    @Schema(description = "Thời điểm bắt đầu khám")
    private LocalDateTime startTime;

    @Schema(description = "Thời điểm kết thúc khám")
    private LocalDateTime endTime;

    @Schema(description = "Thời điểm khám (medical record)")
    private LocalDateTime examDate;

    @Schema(description = "Danh sách dịch vụ sử dụng", example = "[2,3]")
    private List<Long> serviceIds;

    @Valid
    @Schema(description = "Danh sách thuốc/vật tư kê kèm")
    private List<AddExamPrescriptionItemRequest> medicines;

    @Schema(description = "Bác sĩ xác nhận cho về/chuyển thanh toán", example = "true")
    private Boolean confirmDischarge;
}
