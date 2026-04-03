package com.petical.controller;

import com.petical.dto.response.ApiResponse;
import com.petical.entity.TreatmentSlip;
import com.petical.service.TreatmentSlipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/treatment-slips")
@Tag(name = "Điều trị", description = "API tạo và cập nhật phiếu điều trị nội trú/ngoại trú")
public class TreatmentSlipController {
    private final TreatmentSlipService treatmentSlipService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo phiếu điều trị", description = "Tạo kế hoạch điều trị sau khi bác sĩ kết luận hướng xử trí")
    public ApiResponse<TreatmentSlip> create(@RequestBody TreatmentSlip request) {
        return ApiResponse.<TreatmentSlip>builder()
                .code(201)
                .message("Created")
                .data(treatmentSlipService.createTreatmentSlip(request))
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết phiếu điều trị", description = "Hiển thị đầy đủ thông tin kế hoạch điều trị theo mã phiếu")
    public ApiResponse<TreatmentSlip> getDetail(@PathVariable long id) {
        return ApiResponse.<TreatmentSlip>builder()
                .data(treatmentSlipService.getTreatmentSlip(id))
                .build();
    }

    @GetMapping("/reception/{receptionId}")
    @Operation(summary = "Danh sách phiếu điều trị theo phiếu tiếp đón", description = "Trả về danh sách phiếu điều trị gắn với một phiếu tiếp đón, sắp xếp mới nhất trước")
    public ApiResponse<List<TreatmentSlip>> getByReceptionId(@PathVariable long receptionId) {
        return ApiResponse.<List<TreatmentSlip>>builder()
                .data(treatmentSlipService.getTreatmentSlipsByReceptionId(receptionId))
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Cập nhật phiếu điều trị", description = "Cho phép điều chỉnh phác đồ, thuốc và thông tin liên quan trong phiếu")
    public ApiResponse<TreatmentSlip> update(@PathVariable long id, @RequestBody TreatmentSlip request) {
        return ApiResponse.<TreatmentSlip>builder()
                .data(treatmentSlipService.updateTreatmentSlip(id, request))
                .build();
    }
}
