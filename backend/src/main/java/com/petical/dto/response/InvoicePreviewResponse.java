package com.petical.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    private LocalDateTime receptionTime;
    private Long medicalRecordId;
    private IdRef medicalRecord;
    private BigDecimal serviceTotal;
    private BigDecimal medicineTotal;
    private CustomerInfo customer;
    private PetInfo pet;
    private List<ChargeItem> chargeItems;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IdRef {
        private Long id;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerInfo {
        private Long id;
        private String fullName;
        private String phoneNumber;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PetInfo {
        private Long id;
        private String name;
        private String species;
        private String breed;
        private BigDecimal weight;
        private String gender;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChargeItem {
        private Long id;
        private String type;
        private Long serviceId;
        private String serviceName;
        private String name;
        private String unit;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discount;
        private BigDecimal insurance;
        private BigDecimal amount;
    }
}
