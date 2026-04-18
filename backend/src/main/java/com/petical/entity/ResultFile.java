package com.petical.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "result_files",
        indexes = {
                @Index(name = "idx_result_files_exam_result", columnList = "exam_result_id"),
                @Index(name = "idx_result_files_service_result", columnList = "service_result_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_result_id")
    private ExamResult examResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_result_id")
    private ServiceResult serviceResult;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String filePath;

    private String originalFileName;

    private String contentType;

    private Long fileSize;

    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
