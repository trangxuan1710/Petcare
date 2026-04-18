package com.petical.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    private int quantity;

    @Column(name = "dose_morning", precision = 6, scale = 2)
    private BigDecimal morning;

    @Column(name = "dose_noon", precision = 6, scale = 2)
    private BigDecimal noon;

    @Column(name = "dose_afternoon", precision = 6, scale = 2)
    private BigDecimal afternoon;

    @Column(name = "dose_evening", precision = 6, scale = 2)
    private BigDecimal evening;

    @Column(columnDefinition = "TEXT")
    private String instruction;

    @Column(name = "dosage_unit")
    private String dosageUnit;
}
