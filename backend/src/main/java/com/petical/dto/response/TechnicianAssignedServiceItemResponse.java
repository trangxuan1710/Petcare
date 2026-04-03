package com.petical.dto.response;

import com.petical.enums.TechnicianServiceTaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@Schema(description = "Thông tin 1 dịch vụ được giao cho kỹ thuật viên")
public class TechnicianAssignedServiceItemResponse {
    @Schema(example = "17")
    private long serviceOrderId;

    @Schema(example = "5")
    private long serviceId;

    @Schema(example = "Xét nghiệm máu")
    private String serviceName;

    @Schema(example = "3")
    private Long petId;

    @Schema(example = "Milu")
    private String petName;

    @Schema(example = "7")
    private Long prescribedByDoctorId;

    @Schema(example = "Dr. Trần Văn B")
    private String prescribedByDoctorName;

    @Schema(example = "WAITING_EXECUTION")
    private TechnicianServiceTaskStatus status;

    @Schema(example = "2026-04-01T10:15:30")
    private LocalDateTime startTime;

    @Schema(example = "2026-04-01T10:45:30")
    private LocalDateTime endTime;
}
