package com.petical.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payload ghi nhận kết quả dịch vụ của kỹ thuật viên")
public class TechnicianRecordServiceResultRequest {
    @Schema(example = "Mẫu xét nghiệm ổn định, không phát hiện bất thường.")
    private String result;

    @Schema(description = "Danh sách thuốc/vật tư đã sử dụng")
    private List<TechnicianUsedMedicineItemRequest> medicines;
}
