package com.petical.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class ExamAggregateResponse {
    private long receptionRecordId;

    private Long examTypeOptionId;
    private String examTypeCode;
    private String examTypeName;
    private boolean emergency;

    private Long medicalRecordId;
    private Long doctorId;
    private String doctorName;
    private String status;
    private LocalDateTime examDate;

    private Long examResultId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long treatmentDirectionId;
    private String treatmentDirectionName;
    private String conclusion;
    private List<String> evidencePaths;
}

