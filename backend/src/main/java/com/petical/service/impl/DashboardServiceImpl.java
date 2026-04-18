package com.petical.service.impl;

import com.petical.entity.ReceptionRecord;
import com.petical.enums.ReceptionStatus;
import com.petical.repository.MedicalRecordRepository;
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

    private static final List<ReceptionStatus> PENDING_EXAM_STATUSES = List.of(ReceptionStatus.WAITING_EXECUTION);

    private final ReceptionRecordRepository receptionRecordRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    @Override
    public Map<String, Long> getDoctorSummary(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.plusDays(1).atStartOfDay();

        List<ReceptionRecord> records = receptionRecordRepository.findByReceptionTimeBetween(start, end);
        Map<Long, Boolean> emergencyByReceptionId = medicalRecordRepository.findByReceptionRecordIdIn(
                        records.stream().map(ReceptionRecord::getId).toList()
                )
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        medicalRecord -> medicalRecord.getReceptionRecord().getId(),
                        medicalRecord -> medicalRecord.isEmergency(),
                        (left, right) -> left
                ));

        long emergencyCases = records.stream()
                .filter(record -> emergencyByReceptionId.getOrDefault(record.getId(), false))
                .count();
        long pendingExaminationCases = records.stream()
                .filter(record -> PENDING_EXAM_STATUSES.contains(record.getStatus()))
                .count();
        long waitingConclusionCases = records.stream()
                .filter(record -> record.getStatus() == ReceptionStatus.WAITING_CONCLUSION)
                .count();
        long completedCases = records.stream()
                .filter(record -> record.getStatus() == ReceptionStatus.PAID)
                .count();

        Map<String, Long> summary = new LinkedHashMap<>();
        summary.put("emergencyCases", emergencyCases);
        summary.put("pendingExaminationCases", pendingExaminationCases);
        summary.put("waitingConclusionCases", waitingConclusionCases);
        summary.put("completedCases", completedCases);
        return summary;
    }
}
