package com.petical.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    @JoinColumn(name = "exam_form_id", nullable = false)
    private ExamForm examForm;

    @Column(nullable = false)
    private String examReason;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String symptomDescription;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false)
    private String status;

    private LocalDateTime receptionTime;
}
