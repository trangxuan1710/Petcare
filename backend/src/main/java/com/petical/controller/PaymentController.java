package com.petical.controller;

import com.petical.dto.response.ApiResponse;
import com.petical.entity.Invoice;
import com.petical.entity.PaymentMethod;
import com.petical.entity.Prepayment;
import com.petical.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Thanh toán", description = "API xem trước chi phí, tạo hóa đơn và quản lý tạm ứng")
public class PaymentController {
    private final PaymentService paymentService;

    @GetMapping("/reception-slips/{id}/invoice")
    @Operation(summary = "Xem trước hóa đơn", description = "Lấy thông tin chi tiết hóa đơn theo phiếu tiếp đón trước khi xác nhận thanh toán")
    public ApiResponse<Invoice> getInvoicePreview(@PathVariable("id") long receptionSlipId) {
        return ApiResponse.<Invoice>builder()
                .data(paymentService.getInvoiceByReceptionSlip(receptionSlipId))
                .build();
    }

    @GetMapping("/payment-methods")
    @Operation(summary = "Lấy danh sách phương thức thanh toán", description = "Trả về các hình thức thanh toán khả dụng để lễ tân lựa chọn")
    public ApiResponse<List<PaymentMethod>> getPaymentMethods() {
        return ApiResponse.<List<PaymentMethod>>builder()
                .data(paymentService.getPaymentMethods())
                .build();
    }

    @PostMapping("/invoices")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo hóa đơn", description = "Xác nhận thanh toán và ghi nhận hóa đơn cho phiếu tiếp đón")
    public ApiResponse<Invoice> createInvoice(@RequestBody Invoice request) {
        return ApiResponse.<Invoice>builder()
                .code(201)
                .message("Created")
                .data(paymentService.createInvoice(request))
                .build();
    }

    @GetMapping("/invoices/{id}")
    @Operation(summary = "Xem chi tiết hóa đơn", description = "Lấy thông tin một hóa đơn theo mã hóa đơn")
    public ApiResponse<Invoice> getInvoice(@PathVariable long id) {
        return ApiResponse.<Invoice>builder()
                .data(paymentService.getInvoice(id))
                .build();
    }

    @PatchMapping("/invoices/{id}")
    @Operation(summary = "Cập nhật hóa đơn", description = "Cập nhật phương thức thanh toán hoặc ghi chú trước khi chốt hóa đơn")
    public ApiResponse<Invoice> updateInvoice(@PathVariable long id, @RequestBody Invoice request) {
        return ApiResponse.<Invoice>builder()
                .data(paymentService.updateInvoice(id, request))
                .build();
    }

    @PostMapping("/prepayments")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo phiếu tạm ứng", description = "Ghi nhận khoản tạm ứng cho một phiếu tiếp đón")
    public ApiResponse<Prepayment> createPrepayment(@RequestBody Prepayment request) {
        return ApiResponse.<Prepayment>builder()
                .code(201)
                .message("Created")
                .data(paymentService.createPrepayment(request))
                .build();
    }

    @GetMapping("/prepayments")
    @Operation(summary = "Lấy danh sách phiếu tạm ứng", description = "Tra cứu các khoản tạm ứng, có thể lọc theo phiếu tiếp đón")
    public ApiResponse<List<Prepayment>> listPrepayments(
            @RequestParam(value = "receptionSlipId", required = false) Long receptionSlipId
    ) {
        return ApiResponse.<List<Prepayment>>builder()
                .data(paymentService.listPrepayments(receptionSlipId))
                .build();
    }
}
