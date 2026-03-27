package com.petical.controller;

import com.petical.dto.response.ApiResponse;
import com.petical.entity.ReceptionRecord;
import com.petical.service.ReceptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reception-slips")
@Tag(name = "Tiếp đón", description = "API quản lý phiếu tiếp đón và trạng thái tiếp nhận")
public class ReceptionSlipController {
    private final ReceptionService receptionService;

    @GetMapping
    @Operation(summary = "Lấy danh sách phiếu tiếp đón", description = "Tra cứu danh sách phiếu theo trạng thái, ngày khám hoặc chi nhánh")
    public ApiResponse<List<ReceptionRecord>> list(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "branchId", required = false) Long branchId
    ) {
        return ApiResponse.<List<ReceptionRecord>>builder()
                .data(receptionService.listReceptionSlips(status, date, branchId))
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết phiếu tiếp đón", description = "Lấy đầy đủ thông tin một phiếu tiếp đón theo mã phiếu")
    public ApiResponse<ReceptionRecord> detail(@PathVariable long id) {
        return ApiResponse.<ReceptionRecord>builder()
                .data(receptionService.getReceptionSlip(id))
                .build();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo phiếu tiếp đón", description = "Tạo mới phiếu khám cho khách hàng và thú cưng đã chọn")
    public ApiResponse<ReceptionRecord> create(@RequestBody ReceptionRecord request) {
        return ApiResponse.<ReceptionRecord>builder()
                .code(201)
                .message("Created")
                .data(receptionService.createReceptionEntity(request))
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Cập nhật phiếu tiếp đón", description = "Cập nhật thông tin như cân nặng, mô tả triệu chứng hoặc lưu ý")
    public ApiResponse<ReceptionRecord> update(@PathVariable long id, @RequestBody ReceptionRecord request) {
        return ApiResponse.<ReceptionRecord>builder()
                .data(receptionService.updateReceptionSlip(id, request))
                .build();
    }
}
