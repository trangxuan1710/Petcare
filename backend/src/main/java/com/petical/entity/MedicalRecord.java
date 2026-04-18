package com.petical.entity;


import com.petical.enums.MedicalRecordStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reception_record_id", nullable = false)
    private ReceptionRecord receptionRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private MedicalRecordStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_type_option_id")
    private ExamTypeOption examTypeOption;

    private boolean emergency;

    private LocalDateTime examDate;
}
