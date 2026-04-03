package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@Schema(name = "PetExamHistoryItemResponse", description = "Một mốc khám/điều trị trong timeline")
public class PetExamHistoryItemResponse {
    @Schema(description = "Mã phiếu tiếp đón", example = "101")
    private long receptionRecordId;
    @Schema(description = "Mã hồ sơ khám", example = "210")
    private Long medicalRecordId;
    @Schema(description = "Loại khám", example = "ngoại trú")
    private String examType;
    @Schema(description = "Trạng thái", example = "đang thực hiện")
    private String status;
    @Schema(description = "Thời gian tiếp đón")
    private LocalDateTime receptionTime;
    @Schema(description = "Thời gian khám")
    private LocalDateTime examDate;
    @Schema(description = "Lý do khám")
    private String examReason;
    @Schema(description = "Mô tả triệu chứng")
    private String symptomDescription;
    @Schema(description = "Ghi chú")
    private String note;
    @Schema(description = "Kết quả chung")
    private String conclusion;
    @Schema(description = "Hướng điều trị")
    private String treatmentDirection;
    @Schema(description = "Danh sách file/ảnh đính kèm")
    private List<String> evidencePaths;
    @Schema(description = "Bác sĩ chính")
    private String mainDoctorName;
    @Schema(description = "Bác sĩ phụ trách")
    private String assistantDoctorName;
    @Schema(description = "Số dịch vụ", example = "2")
    private int serviceCount;
    @Schema(description = "Số thuốc/vật tư", example = "3")
    private int medicineCount;
    @Schema(description = "Danh sách dịch vụ")
    private List<PetExamHistoryServiceResponse> services;
    @Schema(description = "Danh sách thuốc/vật tư")
    private List<PetExamHistoryMedicineResponse> medicines;
}