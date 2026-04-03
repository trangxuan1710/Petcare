package com.petical.controller;

import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.MedicineSearchItemResponse;
import com.petical.service.ExamPrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping
@Tag(name = "Thuốc", description = "API tìm thuốc/vật tư cho màn ghi nhận kết quả khám")
public class ExamPrescriptionController {
    private final ExamPrescriptionService examPrescriptionService;

    @GetMapping("/medicines/search")
    @Operation(summary = "Tìm thuốc/vật tư", description = "Tìm danh sách thuốc/vật tư theo từ khóa để hiển thị màn chọn thuốc")
    public ApiResponse<List<MedicineSearchItemResponse>> searchMedicines(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return ApiResponse.<List<MedicineSearchItemResponse>>builder()
                .data(examPrescriptionService.searchMedicines(keyword, limit))
                .build();
    }
}
