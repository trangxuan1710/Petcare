package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@Schema(name = "SaveParaclinicalServicesResponse", description = "Kết quả lưu danh sách dịch vụ cận lâm sàng")
public class SaveParaclinicalServicesResponse {
    @Schema(description = "Mã phiếu tiếp đón", example = "30")
    private long receptionRecordId;

    @Schema(description = "Mã hồ sơ khám", example = "21")
    private long medicalRecordId;

    @Schema(description = "Số dòng dịch vụ đã lưu", example = "2")
    private int totalSelected;

    @Schema(description = "Danh sách dịch vụ đã chọn")
    private List<ParaclinicalSelectedServiceResponse> selectedServices;
}
