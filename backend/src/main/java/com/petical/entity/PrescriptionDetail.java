package com.petical.entity;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "dose_morning")
    private Integer morning;

    @Column(name = "dose_noon")
    private Integer noon;

    @Column(name = "dose_afternoon")
    private Integer afternoon;

    @Column(name = "dose_evening")
    private Integer evening;

    @Column(columnDefinition = "TEXT")
    private String instruction;

    @Column(name = "dosage_unit")
    private String dosageUnit;
}
