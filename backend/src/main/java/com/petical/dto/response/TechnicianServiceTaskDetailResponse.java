package com.petical.dto.response;

import com.petical.enums.TechnicianServiceTaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@Schema(description = "Chi tiết công việc kỹ thuật viên")
public class TechnicianServiceTaskDetailResponse {
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

    @Schema(example = "IN_PROGRESS")
    private TechnicianServiceTaskStatus status;

    @Schema(example = "2026-04-01T10:15:30")
    private LocalDateTime startTime;

    @Schema(example = "2026-04-01T10:45:30")
    private LocalDateTime endTime;

    @Schema(example = "Mẫu xét nghiệm ổn định")
    private String result;

    @Schema(description = "Danh sách file ảnh báo cáo")
    private List<String> evidencePaths;

    private List<TechnicianUsedMedicineItemResponse> medicines;
}
