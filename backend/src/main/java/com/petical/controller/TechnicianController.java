package com.petical.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petical.dto.request.TechnicianRecordServiceResultRequest;
import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.TechnicianAssignedServiceListResponse;
import com.petical.dto.response.TechnicianServiceTaskDetailResponse;
import com.petical.enums.ErrorCode;
import com.petical.enums.TechnicianServiceTaskStatus;
import com.petical.errors.AppException;
import com.petical.service.TechnicianWorkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/technicians")
@Tag(name = "Kỹ thuật viên", description = "API nghiệp vụ kỹ thuật viên: xem công việc, bắt đầu xử lý, ghi nhận kết quả")
public class TechnicianController {

    private final TechnicianWorkService technicianWorkService;
        private final ObjectMapper objectMapper;

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

    @GetMapping("/me/assigned-services/{serviceOrderId}")
    @Operation(summary = "Chi tiết công việc của tôi", description = "Kỹ thuật viên đăng nhập xem chi tiết 1 dịch vụ được giao")
    public ApiResponse<TechnicianServiceTaskDetailResponse> getMyAssignedServiceDetail(
            @PathVariable long serviceOrderId
    ) {
        return ApiResponse.<TechnicianServiceTaskDetailResponse>builder()
                .data(technicianWorkService.getMyAssignedServiceDetail(serviceOrderId))
                .build();
    }

    @PatchMapping("/me/assigned-services/{serviceOrderId}/start")
    @Operation(summary = "Bắt đầu công việc", description = "Chuyển trạng thái dịch vụ kỹ thuật viên sang đang thực hiện")
    public ApiResponse<TechnicianServiceTaskDetailResponse> startMyAssignedService(
            @PathVariable long serviceOrderId
    ) {
        return ApiResponse.<TechnicianServiceTaskDetailResponse>builder()
                .data(technicianWorkService.startMyAssignedService(serviceOrderId))
                .build();
    }

    @PostMapping(value = "/me/assigned-services/{serviceOrderId}/result", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ghi nhận kết quả kỹ thuật", description = "Lưu kết quả, thuốc/vật tư sử dụng và ảnh báo cáo của kỹ thuật viên")
    public ApiResponse<TechnicianServiceTaskDetailResponse> recordMyAssignedServiceResult(
            @PathVariable long serviceOrderId,
            @RequestPart("payload") String payload,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        TechnicianRecordServiceResultRequest request = parsePayload(payload);
        return ApiResponse.<TechnicianServiceTaskDetailResponse>builder()
                .code(201)
                .message("Created")
                .data(technicianWorkService.recordMyAssignedServiceResult(serviceOrderId, request, images))
                .build();
    }

    private TechnicianRecordServiceResultRequest parsePayload(String payload) {
        if (payload == null || payload.isBlank()) {
            return TechnicianRecordServiceResultRequest.builder().build();
        }

        try {
            return objectMapper.readValue(payload, TechnicianRecordServiceResultRequest.class);
        } catch (JsonProcessingException exception) {
            throw new AppException(ErrorCode.INVALID_REQUEST_BODY);
        }
    }
}
