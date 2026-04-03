package com.petical.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DoctorDashboardSummaryResponse {
    private long emergencyCases;
    private long pendingExaminationCases;
    private long waitingConclusionCases;
    private long waitingTreatmentCases;
}