package com.petical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.petical.enums.ReceptionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ReceptionRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receptionist_id", nullable = false)
    private Receptionist receptionist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_form_id", nullable = false)
    private ExamForm examForm;

    @Column(nullable = false)
    private String examReason;

    @Column(columnDefinition = "TEXT")
    private String symptomDescription;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "weight_kg", precision = 6, scale = 2)
    private BigDecimal weight;

    @Column(nullable = false)
    private ReceptionStatus status;

    private LocalDateTime receptionTime;

    @PrePersist
    public void prePersist() {
        if (receptionTime == null) {
            receptionTime = LocalDateTime.now();
        }
        if (status == null) {
            status = ReceptionStatus.WAITING_EXECUTION;
        }
    }

    @PreUpdate
    public void preUpdate() {
        if (status == null) {
            status = ReceptionStatus.WAITING_EXECUTION;
        }
    }
}
