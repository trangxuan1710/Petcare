package com.petical.service;

import com.petical.dto.response.DoctorDashboardSummaryResponse;
import com.petical.dto.response.DoctorWaitingCaseResponse;
import com.petical.entity.ReceptionRecord;
import com.petical.enums.ReceptionStatus;

import java.time.LocalDate;
import java.util.List;

public interface DoctorService {
    List<DoctorWaitingCaseResponse> getDoctorsWithWaitingCases();
    DoctorDashboardSummaryResponse getMyDashboardSummary(LocalDate date);
    List<ReceptionRecord> getMyReceptionSlips(List<ReceptionStatus> states, LocalDate date);
}