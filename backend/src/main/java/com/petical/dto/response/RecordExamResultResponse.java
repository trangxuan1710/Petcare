package com.petical.dto.response;

import com.petical.enums.ReceptionStatus;
import com.petical.enums.TreatmentDecision;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@Schema(name = "RecordExamResultResponse", description = "Kết quả ghi nhận khám")
public class RecordExamResultResponse {
    @Schema(description = "Mã phiếu tiếp đón", example = "30")
    private long receptionRecordId;

    @Schema(description = "Mã hồ sơ khám", example = "21")
    private long medicalRecordId;

    @Schema(description = "Mã kết quả khám", example = "35")
    private long examResultId;

    @Schema(description = "Kết luận điều trị đã áp dụng")
    private TreatmentDecision treatmentDecision;

    @Schema(description = "Mã đơn thuốc", example = "18")
    private Long prescriptionId;

    @Schema(description = "Danh sách file ảnh kết quả khám")
    private List<String> evidencePaths;

    @Schema(description = "Số dịch vụ đã gắn", example = "2")
    private int serviceCount;

    @Schema(description = "Số dòng thuốc đã lưu", example = "3")
    private int medicineCount;

    @Schema(description = "Trạng thái phiếu tiếp đón sau khi ghi nhận")
    private ReceptionStatus receptionStatus;
}
