package com.petical.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@Schema(description = "Danh sách dịch vụ được phân công cho kỹ thuật viên")
public class TechnicianAssignedServiceListResponse {
    @Schema(example = "21")
    private long technicianId;

    @Schema(example = "5")
    private long waitingCount;

    @Schema(example = "2")
    private long inProgressCount;

    @Schema(example = "8")
    private long completedCount;

    @Schema(example = "15")
    private long totalCount;

    private List<TechnicianAssignedServiceItemResponse> items;
}
