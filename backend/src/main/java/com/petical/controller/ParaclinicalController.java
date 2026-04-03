package com.petical.controller;

import com.petical.dto.request.SaveParaclinicalServicesRequest;
import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.ParaclinicalSelectedServiceResponse;
import com.petical.dto.response.ParaclinicalServiceOptionResponse;
import com.petical.dto.response.SaveParaclinicalServicesResponse;
import com.petical.dto.response.TechnicianOptionResponse;
import com.petical.service.ParaclinicalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping
@Tag(name = "Cận lâm sàng", description = "API chọn dịch vụ cận lâm sàng và kỹ thuật viên thực hiện")
public class ParaclinicalController {
    private final ParaclinicalService paraclinicalService;

    @GetMapping("/technicians/search")
    @Operation(summary = "Tìm kỹ thuật viên", description = "Tìm kỹ thuật viên theo tên để chọn người thực hiện dịch vụ")
    public ApiResponse<List<TechnicianOptionResponse>> searchTechnicians(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return ApiResponse.<List<TechnicianOptionResponse>>builder()
                .data(paraclinicalService.searchTechnicians(keyword, limit))
                .build();
    }

    @GetMapping("/paraclinical-services/search")
    @Operation(summary = "Tìm dịch vụ cận lâm sàng", description = "Tìm dịch vụ theo tên để hiển thị kết quả chọn dịch vụ")
    public ApiResponse<List<ParaclinicalServiceOptionResponse>> searchParaclinicalServices(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return ApiResponse.<List<ParaclinicalServiceOptionResponse>>builder()
                .data(paraclinicalService.searchServices(keyword, limit))
                .build();
    }

    @GetMapping("/reception-slips/{id}/paraclinical-services")
    @Operation(summary = "Lấy dịch vụ cận lâm sàng đã chọn", description = "Lấy danh sách dịch vụ đã chọn để hiển thị bên dưới kết quả tìm kiếm")
    public ApiResponse<List<ParaclinicalSelectedServiceResponse>> getSelectedServices(@PathVariable("id") long receptionRecordId) {
        return ApiResponse.<List<ParaclinicalSelectedServiceResponse>>builder()
                .data(paraclinicalService.getSelectedServices(receptionRecordId))
                .build();
    }

    @PostMapping("/reception-slips/{id}/paraclinical-services")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Lưu dịch vụ cận lâm sàng đã chọn", description = "Lưu danh sách dịch vụ + kỹ thuật viên thực hiện cho phiếu tiếp đón")
    public ApiResponse<SaveParaclinicalServicesResponse> saveSelectedServices(
            @PathVariable("id") long receptionRecordId,
            @Valid @RequestBody SaveParaclinicalServicesRequest request
    ) {
        return ApiResponse.<SaveParaclinicalServicesResponse>builder()
                .code(201)
                .message("Created")
                .data(paraclinicalService.saveSelectedServices(receptionRecordId, request))
                .build();
    }
}
