package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@Schema(name = "ReceptionAssignedServiceResponse", description = "Dịch vụ đã được chỉ định cho phiếu tiếp đón")
public class ReceptionAssignedServiceResponse {
    @Schema(description = "Mã dịch vụ", example = "2")
    private long serviceId;

    @Schema(description = "Tên dịch vụ", example = "Xét nghiệm máu")
    private String serviceName;

    @Schema(description = "Đơn giá", example = "120000")
    private BigDecimal unitPrice;

    @Schema(description = "Số lượt thực hiện", example = "1")
    private int quantity;

    @Schema(description = "Mã người thực hiện", example = "1")
    private Long performerId;

    @Schema(description = "Tên người thực hiện", example = "Nguyễn Văn A")
    private String performerName;

    @Schema(description = "Vai trò người thực hiện", example = "DOCTOR")
    private String performerRole;

    @Schema(description = "Trạng thái dịch vụ", example = "in_progress")
    private String status;

    @Schema(description = "Thời gian bắt đầu thực hiện dịch vụ", example = "2026-04-04T09:30:00")
    private LocalDateTime startedAt;

    @Schema(description = "Kết quả dịch vụ", example = "Đã hoàn tất siêu âm ổ bụng")
    private String result;

    @Schema(description = "Danh sách file/ảnh đính kèm của dịch vụ")
    private List<String> evidencePaths;

    @Schema(description = "Danh sách thuốc/vật tư thực tế sử dụng của dịch vụ")
    private List<TechnicianUsedMedicineItemResponse> medicines;
}
