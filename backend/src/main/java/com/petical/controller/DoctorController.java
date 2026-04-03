package com.petical.controller;

import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.DoctorDashboardSummaryResponse;
import com.petical.dto.response.DoctorWaitingCaseResponse;
import com.petical.entity.ReceptionRecord;
import com.petical.enums.ReceptionStatus;
import com.petical.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/doctors")
@Tag(name = "Bác sĩ", description = "API riêng cho nghiệp vụ bác sĩ")
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/waiting-cases")
    @Operation(summary = "Danh sách bác sĩ và số ca chờ", description = "Trả về danh sách bác sĩ kèm số lượng ca đang chờ bác sĩ xử lý")
    public ApiResponse<List<DoctorWaitingCaseResponse>> getDoctorsWithWaitingCases() {
        return ApiResponse.<List<DoctorWaitingCaseResponse>>builder()
                .data(doctorService.getDoctorsWithWaitingCases())
                .build();
    }

    @GetMapping("/me/dashboard-summary")
    @Operation(summary = "Thống kê dashboard bác sĩ", description = "Số ca cấp cứu, cần khám, cần kết luận, đang chờ trị của bác sĩ đang đăng nhập")
    public ApiResponse<DoctorDashboardSummaryResponse> getMyDashboardSummary(
            @RequestParam(value = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return ApiResponse.<DoctorDashboardSummaryResponse>builder()
                .data(doctorService.getMyDashboardSummary(date))
                .build();
    }

        @GetMapping("/me/reception-slips")
        @Operation(summary = "Danh sách phiếu khám của tôi", description = "Trả về các phiếu khám được phân cho bác sĩ đăng nhập (lọc theo token), hỗ trợ lọc trạng thái và ngày")
        public ApiResponse<List<ReceptionRecord>> getMyReceptionSlips(
            @RequestParam(value = "states", required = false) List<ReceptionStatus> states,
            @RequestParam(value = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
        ) {
        return ApiResponse.<List<ReceptionRecord>>builder()
            .data(doctorService.getMyReceptionSlips(states, date))
            .build();
        }
}