package com.petical.service.impl;

import com.petical.repository.ReceptionRecordRepository;
import com.petical.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final List<String> PENDING_EXAM_STATUSES = List.of("RECEIVED", "Đã tiếp đón");
    private static final String WAITING_CONCLUSION_STATUS = "WAITING_CONCLUSION";
    private static final String COMPLETED_STATUS = "COMPLETED";

    private final ReceptionRecordRepository receptionRecordRepository;

    @Override
    public Map<String, Long> getDoctorSummary(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay();

        long emergencyCases = receptionRecordRepository
                .countByExamFormIsEmergencyTrueAndReceptionTimeBetween(start, end);
        long pendingExaminationCases = receptionRecordRepository
                .countByStatusIgnoreCaseInAndReceptionTimeBetween(PENDING_EXAM_STATUSES, start, end);
        long waitingConclusionCases = receptionRecordRepository
                .countByStatusIgnoreCaseAndReceptionTimeBetween(WAITING_CONCLUSION_STATUS, start, end);
        long completedCases = receptionRecordRepository
                .countByStatusIgnoreCaseAndReceptionTimeBetween(COMPLETED_STATUS, start, end);

        Map<String, Long> summary = new LinkedHashMap<>();
        summary.put("emergencyCases", emergencyCases);
        summary.put("pendingExaminationCases", pendingExaminationCases);
        summary.put("waitingConclusionCases", waitingConclusionCases);
        summary.put("completedCases", completedCases);
        return summary;
    }
}
