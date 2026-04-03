package com.petical.controller;

import com.petical.dto.request.CreateReceptionSlipRequest;
import com.petical.dto.request.UpdateReceptionSlipRequest;
import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.ReceptionAssignedServiceResponse;
import com.petical.entity.ReceptionRecord;
import com.petical.enums.ReceptionStatus;
import com.petical.service.ReceptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
    @Operation(summary = "Lấy danh sách phiếu tiếp đón", description = "Tra cứu danh sách phiếu theo trạng thái hoặc ngày khám")
    public ApiResponse<List<ReceptionRecord>> list(
            @RequestParam(value = "status", required = false) ReceptionStatus status,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "branchId", required = false) Long branchId
    ) {
        return ApiResponse.<List<ReceptionRecord>>builder()
                .data(receptionService.listReceptionSlips(status, date, branchId))
                .build();
    }

    @GetMapping("/by-state")
    @Operation(summary = "Lấy danh sách phiếu theo state", description = "Lọc phiếu theo một hoặc nhiều state: chờ thực hiện, chờ kết luận, đang thực hiện, chờ thanh toán, đã thanh toán")
    public ApiResponse<List<ReceptionRecord>> listByStates(
            @RequestParam("states") List<ReceptionStatus> states,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ApiResponse.<List<ReceptionRecord>>builder() 
                .data(receptionService.listReceptionSlipsByStates(states, date))
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết phiếu tiếp đón", description = "Lấy đầy đủ thông tin một phiếu tiếp đón theo mã phiếu")
    public ApiResponse<ReceptionRecord> detail(@PathVariable long id) {
        return ApiResponse.<ReceptionRecord>builder()
                .data(receptionService.getReceptionSlip(id))
                .build();
    }

        @GetMapping("/{id}/services")
        @Operation(summary = "Lấy dịch vụ đã chỉ định", description = "Trả về danh sách dịch vụ đã được bác sĩ chỉ định cho phiếu tiếp đón")
        public ApiResponse<List<ReceptionAssignedServiceResponse>> assignedServices(@PathVariable long id) {
                return ApiResponse.<List<ReceptionAssignedServiceResponse>>builder()
                                .data(receptionService.getAssignedServices(id))
                                .build();
        }

        @PostMapping("/{id}/services/default-clinical")
        @Operation(summary = "Khởi tạo dịch vụ khám mặc định", description = "Đảm bảo phiếu tiếp đón có dịch vụ khám mặc định (serviceId=1) ở trạng thái chờ thực hiện")
        public ApiResponse<Void> initDefaultClinicalService(@PathVariable long id) {
                receptionService.ensureDefaultClinicalServicePending(id);
                return ApiResponse.<Void>builder().build();
        }

    @PostMapping({"", "/save"})
    @Operation(summary = "Lưu phiếu tiếp đón", description = "Lưu mới phiếu tiếp đón từ thông tin khách hàng, thú cưng, bác sĩ phụ trách và lý do khám")
    public ApiResponse<ReceptionRecord> create(@Valid @RequestBody CreateReceptionSlipRequest request) {
        return ApiResponse.<ReceptionRecord>builder()
                .code(201)
                .message("Created")
                .data(receptionService.createReceptionSlip(request))
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Cập nhật phiếu tiếp đón", description = "Cập nhật thông tin như cân nặng, mô tả triệu chứng hoặc lưu ý")
    public ApiResponse<ReceptionRecord> update(@PathVariable long id, @RequestBody UpdateReceptionSlipRequest request) {
        return ApiResponse.<ReceptionRecord>builder()
                .data(receptionService.updateReceptionSlip(id, request))
                .build();
    }
}
