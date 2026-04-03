package com.petical.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoicePreviewResponse {
    private Long id;
    private BigDecimal totalAmount;
    private String status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime paymentDate;
    private Long medicalRecordId;
    private IdRef medicalRecord;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IdRef {
        private Long id;
    }
}