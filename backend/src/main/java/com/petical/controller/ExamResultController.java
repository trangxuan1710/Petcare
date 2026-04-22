package com.petical.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petical.dto.request.RecordExamResultRequest;
import com.petical.dto.response.ApiResponse;
import com.petical.dto.response.RecordResultContextResponse;
import com.petical.dto.response.RecordExamResultResponse;
import com.petical.enums.ErrorCode;
import com.petical.errors.AppException;
import com.petical.service.ExamResultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reception-slips")
@Tag(name = "Kết quả khám", description = "API ghi nhận kết quả khám và cập nhật trạng thái phiếu tiếp đón")
public class ExamResultController {
    private final ExamResultService examResultService;
    private final ObjectMapper objectMapper;

    @GetMapping("/{id}/exam-results/context")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Lấy dữ liệu màn ghi nhận kết quả", description = "Trả về dữ liệu tổng hợp cho màn Ghi nhận kết quả: phiếu tiếp đón, phiếu điều trị gần nhất/theo id, dịch vụ cận lâm sàng đã chọn và dịch vụ đã chỉ định")
    public ApiResponse<RecordResultContextResponse> getRecordResultContext(
            @PathVariable("id") long receptionRecordId,
            @RequestParam(value = "treatmentSlipId", required = false) Long treatmentSlipId
    ) {
        return ApiResponse.<RecordResultContextResponse>builder()
                .data(examResultService.getRecordResultContext(receptionRecordId, treatmentSlipId))
                .build();
    }

    @PostMapping("/{id}/result-summary-confirmation")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "XÃ¡c nháº­n Ä‘Ã£ xem tá»•ng há»£p káº¿t quáº£", description = "ÄÃ¡nh dáº¥u phiáº¿u tiáº¿p Ä‘Ã³n Ä‘Ã£ Ä‘Æ°á»£c bÃ¡c sÄ© xÃ¡c nháº­n tá»•ng há»£p káº¿t quáº£, cho phÃ©p thá»±c hiá»‡n káº¿t luáº­n")
    public ApiResponse<Void> confirmResultSummary(@PathVariable("id") long receptionRecordId) {
        examResultService.confirmResultSummary(receptionRecordId);
        return ApiResponse.<Void>builder()
                .code(200)
                .message("OK")
                .build();
    }

    @PostMapping(value = "/{id}/exam-results", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ghi nhận kết quả khám", description = "Tạo/cập nhật hồ sơ khám, dịch vụ và đơn thuốc theo form-data; hỗ trợ đính kèm ảnh kết quả khám")
    public ApiResponse<RecordExamResultResponse> recordResult(
            @PathVariable("id") long receptionRecordId,
            @RequestPart("payload") String payload,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        RecordExamResultRequest request = parsePayload(payload);

        return ApiResponse.<RecordExamResultResponse>builder()
                .code(201)
                .message("Created")
                .data(examResultService.recordResult(receptionRecordId, request, images))
                .build();
    }

    @PostMapping(value = "/{id}/exam-results/confirmed", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ghi nhan ket qua kham (yeu cau da xac nhan tong hop)", description = "Tuong tu API ghi nhan ket qua nhung bat buoc bac si da xac nhan xem tong hop ket qua truoc khi ket luan")
    public ApiResponse<RecordExamResultResponse> recordResultWithConfirmedSummary(
            @PathVariable("id") long receptionRecordId,
            @RequestPart("payload") String payload,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        RecordExamResultRequest request = parsePayload(payload);

        return ApiResponse.<RecordExamResultResponse>builder()
                .code(201)
                .message("Created")
                .data(examResultService.recordResultWithConfirmedSummary(receptionRecordId, request, images))
                .build();
    }

    private RecordExamResultRequest parsePayload(String payload) {
        if (payload == null || payload.isBlank()) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }

        try {
            return objectMapper.readValue(payload, RecordExamResultRequest.class);
        } catch (JsonProcessingException exception) {
            throw new AppException(ErrorCode.INVALID_REQUEST_BODY);
        }
    }
}
