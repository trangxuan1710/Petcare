package com.petical.controller;

import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.TechnicianAssignedServiceListResponse;
import com.petical.enums.TechnicianServiceTaskStatus;
import com.petical.service.TechnicianWorkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/technicians")
@Tag(name = "Kỹ thuật viên", description = "API danh sách dịch vụ cần thực hiện của kỹ thuật viên")
public class TechnicianController {

    private final TechnicianWorkService technicianWorkService;

    @GetMapping("/{id}/assigned-services")
    @Operation(summary = "Danh sách dịch vụ theo kỹ thuật viên", description = "Lấy danh sách dịch vụ mà kỹ thuật viên được phân công, kèm bác sĩ chỉ định")
    public ApiResponse<TechnicianAssignedServiceListResponse> getAssignedServices(
            @PathVariable("id") long technicianId,
            @RequestParam(value = "status", required = false) TechnicianServiceTaskStatus status,
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        return ApiResponse.<TechnicianAssignedServiceListResponse>builder()
                .data(technicianWorkService.getAssignedServices(technicianId, status, keyword))
                .build();
    }

    @GetMapping("/me/assigned-services")
    @Operation(summary = "Danh sách dịch vụ của tôi", description = "Kỹ thuật viên đăng nhập lấy các dịch vụ được giao và bác sĩ chỉ định")
    public ApiResponse<TechnicianAssignedServiceListResponse> getMyAssignedServices(
            @RequestParam(value = "status", required = false) TechnicianServiceTaskStatus status,
            @RequestParam(value = "keyword", required = false) String keyword
    ) {
        return ApiResponse.<TechnicianAssignedServiceListResponse>builder()
                .data(technicianWorkService.getMyAssignedServices(status, keyword))
                .build();
    }
}
