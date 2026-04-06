package com.petical.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionAutofillResponse {
    private boolean firstVisit;
    private boolean hasRecommendation;
    private String breed;
    private BigDecimal currentWeight;
    private Long sourceReceptionId;
    private BigDecimal sourceWeight;
    private List<MedicineItem> medicines;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineItem {
        private Long id;
        private String name;
        private String type;
        private String unit;
        private BigDecimal price;
        private Integer stockQuantity;
        private Integer quantity;
        private Dosage dosage;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Dosage {
        private Integer morning;
        private Integer noon;
        private Integer afternoon;
        private Integer evening;
        private String note;
    }
}