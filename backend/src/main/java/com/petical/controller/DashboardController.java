package com.petical.controller;

import com.petical.dto.response.ApiResponse;
import com.petical.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/dashboard")
@Tag(name = "Dashboard", description = "API thống kê nhanh cho màn hình tổng quan")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/doctor-summary")
    @Operation(
            summary = "Thống kê tổng quan bác sĩ",
            description = "Trả về số ca cấp cứu, ca chờ khám, ca chờ kết luận và ca đã hoàn tất trong ngày"
    )
    public ApiResponse<Map<String, Long>> getDoctorSummary(
            @RequestParam(value = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return ApiResponse.<Map<String, Long>>builder()
                .data(dashboardService.getDoctorSummary(date))
                .build();
    }
}
