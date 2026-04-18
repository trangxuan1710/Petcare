package com.petical.entity;

import com.petical.enums.ExamType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "exam_type_options",
        uniqueConstraints = @UniqueConstraint(name = "uk_exam_type_options_code", columnNames = "code")
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamTypeOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExamType examType;

    private boolean active;

    private int sortOrder;
}
