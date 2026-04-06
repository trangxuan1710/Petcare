package com.petical.entity;


import jakarta.persistence.*;
import lombok.*;

@Table(
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"reception_service_id"})
    }
)
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_result_id", nullable = false)
    private ExamResult examResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reception_service_id")
    private ReceptionService receptionService;
}
