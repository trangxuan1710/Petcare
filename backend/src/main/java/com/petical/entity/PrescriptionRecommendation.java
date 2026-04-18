package com.petical.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
    name = "prescription_recommendation",
    indexes = {
        @Index(name = "idx_prescription_recommendation_filter", columnList = "medicine_id,species_id,min_weight,max_weight")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "species_id")
    private PetSpecies species;

    @Column(name = "min_weight", precision = 6, scale = 2)
    private BigDecimal minWeight;

    @Column(name = "max_weight", precision = 6, scale = 2)
    private BigDecimal maxWeight;

    @Builder.Default
    @Column(name = "dose_morning", precision = 6, scale = 2, nullable = false)
    private BigDecimal doseMorning = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "dose_noon", precision = 6, scale = 2, nullable = false)
    private BigDecimal doseNoon = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "dose_afternoon", precision = 6, scale = 2, nullable = false)
    private BigDecimal doseAfternoon = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "dose_evening", precision = 6, scale = 2, nullable = false)
    private BigDecimal doseEvening = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "dosage_unit", length = 255)
    private String dosageUnit;

    @Builder.Default
    @Column(name = "treatment_days", nullable = false)
    private Integer treatmentDays = 1;

    @Column(columnDefinition = "TEXT")
    private String instruction;
}
