package com.petical.entity;

import com.petical.enums.ReceptionServiceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "reception_services",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"reception_record_id", "service_id"})
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceptionService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reception_record_id", nullable = false)
    private ReceptionRecord receptionRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private ReceptionServiceStatus status;

    private LocalDateTime startedAt;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = ReceptionServiceStatus.PENDING;
        }
    }
}