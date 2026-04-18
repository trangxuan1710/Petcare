package com.petical.service.impl;

import com.petical.dto.response.DoctorDashboardSummaryResponse;
import com.petical.dto.response.DoctorWaitingCaseResponse;
import com.petical.entity.Doctor;
import com.petical.entity.ReceptionRecord;
import com.petical.entity.User;
import com.petical.enums.ErrorCode;
import com.petical.enums.ReceptionStatus;
import com.petical.errors.AppException;
import com.petical.repository.DoctorRepository;
import com.petical.repository.MedicalRecordRepository;
import com.petical.repository.ReceptionRecordRepository;
import com.petical.repository.projection.DoctorWaitingCaseCountProjection;
import com.petical.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

        private static final List<ReceptionStatus> PENDING_EXAM_STATUSES = List.of(ReceptionStatus.WAITING_EXECUTION);
        private static final List<ReceptionStatus> WAITING_TREATMENT_STATUSES = List.of(ReceptionStatus.IN_PROGRESS);
        private static final List<ReceptionStatus> ACTIVE_WORKLOAD_STATUSES = List.of(
                ReceptionStatus.WAITING_EXECUTION,
                ReceptionStatus.IN_PROGRESS,
                ReceptionStatus.WAITING_CONCLUSION
        );
        private static final long DEFAULT_RECENT_DAYS = 7;

    private final DoctorRepository doctorRepository;
    private final ReceptionRecordRepository receptionRecordRepository;
    private final MedicalRecordRepository medicalRecordRepository;

        private Doctor getCurrentDoctorFromToken() {
                User principal = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                if (!(principal instanceof Doctor doctor)) {
                        throw new AppException(ErrorCode.NO_PERMISSION);
                }
                return doctor;
        }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorWaitingCaseResponse> getDoctorsWithWaitingCases() {
        List<Doctor> doctors = doctorRepository.findAll();
        List<Long> doctorIds = doctors.stream().map(Doctor::getId).toList();

        if (doctorIds.isEmpty()) {
            return List.of();
        }

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.minusDays(DEFAULT_RECENT_DAYS - 1).atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        Map<Long, Long> waitingCountByDoctorId = new HashMap<>();
        List<DoctorWaitingCaseCountProjection> waitingCounts = receptionRecordRepository
                .countWaitingCasesByDoctorIds(doctorIds, ACTIVE_WORKLOAD_STATUSES, start, end);
        waitingCounts.forEach(item -> waitingCountByDoctorId.put(item.getDoctorId(), item.getWaitingCaseCount()));

        return doctors.stream()
                .map(doctor -> DoctorWaitingCaseResponse.builder()
                        .id(doctor.getId())
                        .fullName(doctor.getFullName())
                        .phoneNumber(doctor.getPhoneNumber())
                        .waitingCaseCount(waitingCountByDoctorId.getOrDefault(doctor.getId(), 0L))
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDashboardSummaryResponse getMyDashboardSummary(LocalDate date) {
                Doctor doctor = getCurrentDoctorFromToken();

                LocalDate targetDate = date != null ? date : LocalDate.now();
                LocalDateTime start;
                LocalDateTime end;

                if (date == null) {
                        start = targetDate.minusDays(DEFAULT_RECENT_DAYS - 1).atStartOfDay();
                        end = targetDate.plusDays(1).atStartOfDay();
                } else {
                        start = targetDate.atStartOfDay();
                        end = targetDate.plusDays(1).atStartOfDay();
                }

        List<ReceptionRecord> doctorRecords = receptionRecordRepository
                .findByDoctorIdAndReceptionTimeBetween(doctor.getId(), start, end);

        long emergencyCases = doctorRecords.stream()
                .filter(record -> record.getStatus() == ReceptionStatus.WAITING_EXECUTION || record.getStatus() == ReceptionStatus.IN_PROGRESS)
                .filter(ReceptionRecord::isEmergency)
                .count();

        long pendingExaminationCases = doctorRecords.stream()
                .filter(record -> PENDING_EXAM_STATUSES.contains(record.getStatus()))
                .count();

        long waitingConclusionCases = doctorRecords.stream()
                .filter(record -> record.getStatus() == ReceptionStatus.WAITING_CONCLUSION)
                .count();

        long waitingTreatmentCases = doctorRecords.stream()
                .filter(record -> WAITING_TREATMENT_STATUSES.contains(record.getStatus()))
                .count();

        return DoctorDashboardSummaryResponse.builder()
                .emergencyCases(emergencyCases)
                .pendingExaminationCases(pendingExaminationCases)
                .waitingConclusionCases(waitingConclusionCases)
                .waitingTreatmentCases(waitingTreatmentCases)
                .build();
    }

        @Override
        @Transactional(readOnly = true)
        public List<ReceptionRecord> getMyReceptionSlips(List<ReceptionStatus> states, LocalDate date) {
                Doctor doctor = getCurrentDoctorFromToken();

                boolean hasStates = states != null && !states.isEmpty();
                boolean hasDate = date != null;

                LocalDate targetDate = hasDate ? date : LocalDate.now();
                LocalDateTime start;
                LocalDateTime end;

                if (hasDate) {
                        start = targetDate.atStartOfDay();
                        end = targetDate.plusDays(1).atStartOfDay();
                } else {
                        start = targetDate.minusDays(DEFAULT_RECENT_DAYS - 1).atStartOfDay();
                        end = targetDate.plusDays(1).atStartOfDay();
                }

                if (!hasStates) {
                        return receptionRecordRepository.findByDoctorIdAndReceptionTimeBetween(doctor.getId(), start, end);
                }

                return receptionRecordRepository.findByDoctorIdAndStatusInAndReceptionTimeBetween(doctor.getId(), states, start, end);
        }
}
