package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@Schema(name = "PetExamHistoryServiceResponse", description = "Thông tin dịch vụ trong một mốc khám")
public class PetExamHistoryServiceResponse {
    @Schema(description = "Mã dịch vụ", example = "1")
    private long serviceId;
    @Schema(description = "Tên dịch vụ", example = "Khám lâm sàng")
    private String serviceName;
    @Schema(description = "Trạng thái dịch vụ", example = "completed")
    private String status;
}