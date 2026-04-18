package com.petical.controller;

import com.petical.dto.request.PrescriptionAutofillContextRequest;
import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.MedicineSearchItemResponse;
import com.petical.dto.response.PrescriptionAutofillResponse;
import com.petical.service.ExamPrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "species", required = false) String species,
            @RequestParam(value = "objective", required = false) String legacyObjective,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        String speciesFilter = species == null || species.isBlank() ? legacyObjective : species;
        return ApiResponse.<List<MedicineSearchItemResponse>>builder()
                .data(examPrescriptionService.searchMedicines(keyword, type, speciesFilter, 10000))
                .build();
    }

    @GetMapping("/reception-slips/{id}/prescription-autofill")
    @Operation(
            summary = "Gợi ý đơn thuốc tự động",
            description = "Chỉ gợi ý cho ca khám đầu tiên của thú cưng, ưu tiên dữ liệu theo giống và cân nặng tương tự"
    )
    public ApiResponse<PrescriptionAutofillResponse> getPrescriptionAutofill(@PathVariable("id") long receptionRecordId) {
        return ApiResponse.<PrescriptionAutofillResponse>builder()
                .data(examPrescriptionService.getPrescriptionAutofill(receptionRecordId))
                .build();
    }

    @PostMapping("/prescription-autofill/recommendations")
    @Operation(
            summary = "Gợi ý đơn thuốc theo ngữ cảnh",
            description = "Gợi ý đơn thuốc dựa trên payload loài vật và cân nặng hiện tại"
    )
    public ApiResponse<PrescriptionAutofillResponse> getPrescriptionAutofillByContext(
            @RequestBody PrescriptionAutofillContextRequest request
    ) {
        return ApiResponse.<PrescriptionAutofillResponse>builder()
                .data(examPrescriptionService.getPrescriptionAutofillByContext(
                        request == null ? null : request.getMedicineId(),
                        request == null ? null : request.getSpeciesId(),
                        request == null ? null : request.getSpecies(),
                        request == null ? null : request.getWeight()
                ))
                .build();
    }
}
