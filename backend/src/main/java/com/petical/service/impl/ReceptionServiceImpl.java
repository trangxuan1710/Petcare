package com.petical.service.impl;

import com.petical.dto.request.CreateReceptionSlipRequest;
import com.petical.dto.request.UpdateReceptionSlipRequest;
import com.petical.dto.response.ReceptionAssignedServiceResponse;
import com.petical.dto.response.TechnicianUsedMedicineItemResponse;
import com.petical.entity.*;
import com.petical.enums.ExamType;
import com.petical.enums.ErrorCode;
import com.petical.enums.ReceptionServiceStatus;
import com.petical.enums.ReceptionStatus;
import com.petical.errors.AppException;
import com.petical.repository.*;
import com.petical.service.ReceptionService;
import com.petical.service.SseNotificationService;
import com.petical.dto.response.NotificationMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceptionServiceImpl implements ReceptionService {

        private static final long DEFAULT_SERVICE_ID = 1L;
        private static final String DEFAULT_EXAM_STATUS_NAME = "IN_PROGRESS";

    private final ClientRepository clientRepository;
    private final PetRepository petRepository;
    private final DoctorRepository doctorRepository;
    private final ReceptionistRepository receptionistRepository;
    private final ExamFormRepository examFormRepository;
    private final ReceptionRecordRepository receptionRecordRepository;
        private final MedicalRecordRepository medicalRecordRepository;
        private final ExamStatusRepository examStatusRepository;
        private final ServiceRepository serviceRepository;
        private final ReceptionServiceRepository receptionServiceRepository;
        private final ServiceOrderRepository serviceOrderRepository;
        private final ExamResultRepository examResultRepository;
        private final ServiceResultRepository serviceResultRepository;
        private final PrescriptionRepository prescriptionRepository;
        private final PrescriptionDetailRepository prescriptionDetailRepository;
        private final SseNotificationService sseNotificationService;

    @Override
    @Transactional
    public ReceptionRecord createReceptionSlip(CreateReceptionSlipRequest request) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new AppException(ErrorCode.CLIENT_NOT_FOUND));

        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new AppException(ErrorCode.PET_NOT_FOUND));

        if (!petRepository.existsByIdAndClientId(pet.getId(), client.getId())) {
            throw new AppException(ErrorCode.PET_NOT_BELONG_TO_CLIENT);
        }

                // Prevent creating a new reception when there's an existing unfinished reception for the same pet
                if (receptionRecordRepository.existsByPetIdAndStatusNot(pet.getId(), ReceptionStatus.PAID)) {
                        throw new AppException(ErrorCode.RECEPTION_ALREADY_OPEN);
                }

        Receptionist receptionist = receptionistRepository.findById(request.getReceptionistId())
                .orElseThrow(() -> new AppException(ErrorCode.RECEPTIONIST_NOT_FOUND));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ExamForm examForm;
        if (request.getExamFormId() != null && request.getExamFormId() > 0) {
            examForm = examFormRepository.findById(request.getExamFormId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        } else {
            examForm = ExamForm.builder()
                                        .examType(request.getExamType() == null ? ExamType.NEW_EXAM : request.getExamType())
                    .isEmergency(Boolean.TRUE.equals(request.getEmergency()))
                    .build();
            examForm = examFormRepository.save(examForm);
        }

        ReceptionRecord receptionRecord = ReceptionRecord.builder()
                .client(client)
                .pet(pet)
                .receptionist(receptionist)
                .doctor(doctor)
                .examForm(examForm)
                .examReason(request.getExamReason().trim())
                .note(request.getNote())
                .weight(request.getWeight())
                .receptionTime(request.getReceptionTime())
                .status(ReceptionStatus.WAITING_EXECUTION)
                .build();

        ReceptionRecord savedRecord = receptionRecordRepository.save(receptionRecord);
        ensureDefaultClinicalServicePending(savedRecord);

        sseNotificationService.sendNotificationToUser(doctor.getId(),
                NotificationMessage.builder()
                        .title("Phiếu tiếp nhận mới")
                        .message("Bạn được phân công một phiếu tiếp nhận mới cho thú cưng " + pet.getName())
                        .timestamp(LocalDateTime.now())
                        .type("NEW_RECEPTION")
                        .build());

        return savedRecord;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceptionRecord> listReceptionSlips(ReceptionStatus receptionStatus, LocalDate date, Long branchId) {
        List<ReceptionRecord> records;

        if (receptionStatus != null && date != null) {
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();
            records = receptionRecordRepository.findByStatusAndReceptionTimeBetween(receptionStatus, start, end);
        } else if (receptionStatus != null) {
            records = receptionRecordRepository.findByStatus(receptionStatus);
        } else if (date != null) {
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();
            records = receptionRecordRepository.findByReceptionTimeBetween(start, end);
        } else {
            records = receptionRecordRepository.findAll();
        }
        return records;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceptionRecord> listReceptionSlipsByStates(List<ReceptionStatus> states, LocalDate date) {
        if (states == null || states.isEmpty()) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }

        List<ReceptionStatus> parsedStates = states.stream().distinct().toList();

        if (date != null) {
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();
            return receptionRecordRepository.findByStatusInAndReceptionTimeBetween(parsedStates, start, end);
        }

        return receptionRecordRepository.findByStatusIn(parsedStates);
    }

    @Override
    @Transactional(readOnly = true)
    public ReceptionRecord getReceptionSlip(long id) {
                ReceptionRecord record = receptionRecordRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                return record;
        }

    @Override
    @Transactional(readOnly = true)
    public List<ReceptionAssignedServiceResponse> getAssignedServices(long receptionId) {
                ReceptionRecord receptionRecord = receptionRecordRepository.findById(receptionId)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

                Doctor assignedDoctor = receptionRecord.getDoctor();
                MedicalRecord medicalRecord = medicalRecordRepository.findByReceptionRecordId(receptionId).orElse(null);
                ExamResult latestExamResult = medicalRecord == null
                                ? null
                                : examResultRepository.findFirstByMedicalRecordIdOrderByIdDesc(medicalRecord.getId()).orElse(null);
                boolean isClinicalServiceCompleted = isClinicalServiceCompleted(latestExamResult);

                Map<Long, ServiceOrder> orderByServiceId = new HashMap<>();
                if (medicalRecord != null) {
                                serviceOrderRepository.findByMedicalRecordId(medicalRecord.getId())
                                                .forEach(order -> {
                                                        if (order.getService() != null && !orderByServiceId.containsKey(order.getService().getId())) {
                                                                orderByServiceId.put(order.getService().getId(), order);
                                                        }
                                                });
                }

                List<com.petical.entity.ReceptionService> scopedServices = receptionServiceRepository.findByReceptionRecordId(receptionId);

                Map<Long, ServiceResult> resultByOrderId = serviceResultRepository.findByServiceOrderIdIn(
                                orderByServiceId.values().stream().map(ServiceOrder::getId).toList())
                                .stream()
                                .collect(Collectors.toMap(result -> result.getServiceOrder().getId(), Function.identity(), (left, right) -> left));

                Map<Long, Prescription> prescriptionByReceptionServiceId = prescriptionRepository
                                .findByReceptionServiceIdIn(scopedServices.stream().map(com.petical.entity.ReceptionService::getId).toList())
                                .stream()
                                .collect(Collectors.toMap(
                                                prescription -> prescription.getReceptionService().getId(),
                                                Function.identity(),
                                                (left, right) -> left.getId() >= right.getId() ? left : right
                                ));

                Map<Long, List<PrescriptionDetail>> prescriptionDetailsByPrescriptionId = prescriptionDetailRepository
                                .findByPrescriptionIdIn(prescriptionByReceptionServiceId.values().stream().map(Prescription::getId).toList())
                                .stream()
                                .collect(Collectors.groupingBy(detail -> detail.getPrescription().getId()));

                return scopedServices
                                .stream()
                                .map(item -> {
                                        Long performerId = assignedDoctor == null ? null : assignedDoctor.getId();
                                        String performerName = assignedDoctor == null ? null : assignedDoctor.getFullName();
                                        String performerRole = assignedDoctor == null ? null : "DOCTOR";

                                        ServiceOrder serviceOrder = orderByServiceId.get(item.getService().getId());
                                        if (serviceOrder != null && serviceOrder.getTechnician() != null) {
                                                performerId = serviceOrder.getTechnician().getId();
                                                performerName = serviceOrder.getTechnician().getFullName();
                                                performerRole = "TECHNICIAN";
                                        }

                                        ServiceResult serviceResult = serviceOrder == null ? null : resultByOrderId.get(serviceOrder.getId());
                                        Prescription prescription = prescriptionByReceptionServiceId.get(item.getId());
                                        List<TechnicianUsedMedicineItemResponse> medicines = prescription == null
                                                        ? List.of()
                                                        : loadUsedMedicines(
                                                                        prescription,
                                                                        prescriptionDetailsByPrescriptionId.getOrDefault(prescription.getId(), List.of())
                                                        );

                                        ReceptionServiceStatus status = deriveServiceStatus(item, receptionRecord.getStatus(), item.getService().getId(), isClinicalServiceCompleted);

                                        return ReceptionAssignedServiceResponse.builder()
                                                        .serviceId(item.getService().getId())
                                                        .serviceName(item.getService().getName())
                                                        .unitPrice(item.getService().getUnitPrice())
                                                        .quantity(1)
                                                        .performerId(performerId)
                                                        .performerName(performerName)
                                                        .performerRole(performerRole)
                                                        .status(status.getValue())
                                                        .startedAt(item.getStartedAt())
                                                        .result(serviceResult == null ? null : normalizeTextOrNull(serviceResult.getResult()))
                                                        .evidencePaths(readEvidencePaths(serviceResult == null ? null : serviceResult.getEvidencePath()))
                                                        .medicines(medicines)
                                                        .build();
                                })
                                .toList();
        }

        @Override
        @Transactional
        public void ensureDefaultClinicalServicePending(long receptionId) {
                ReceptionRecord receptionRecord = receptionRecordRepository.findById(receptionId)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                ensureDefaultClinicalServicePending(receptionRecord);
        }

        private ReceptionServiceStatus deriveServiceStatus(com.petical.entity.ReceptionService receptionService,
                        ReceptionStatus receptionStatus,
                        long serviceId,
                        boolean isClinicalServiceCompleted) {
                if (serviceId == DEFAULT_SERVICE_ID && isClinicalServiceCompleted) {
                        return ReceptionServiceStatus.COMPLETED;
                }

                if (receptionStatus == ReceptionStatus.PAID) {
                        return ReceptionServiceStatus.COMPLETED;
                }

                if (receptionService.getStatus() != null) {
                        return receptionService.getStatus();
                }

                if (receptionStatus == ReceptionStatus.IN_PROGRESS
                                || receptionStatus == ReceptionStatus.WAITING_CONCLUSION
                                || receptionStatus == ReceptionStatus.WAITING_PAYMENT) {
                        return ReceptionServiceStatus.IN_PROGRESS;
                }

                return ReceptionServiceStatus.PENDING;
        }

        private boolean isClinicalServiceCompleted(ExamResult examResult) {
                if (examResult == null || examResult.getTreatmentDirection() == null || examResult.getTreatmentDirection().getName() == null) {
                        return false;
                }

                String directionName = examResult.getTreatmentDirection().getName().trim().toLowerCase();
                return directionName.contains("cận lâm sàng") || directionName.contains("paraclinical");
        }

        private String normalizeTextOrNull(String value) {
                if (value == null) {
                        return null;
                }
                String normalized = value.trim();
                return normalized.isEmpty() ? null : normalized;
        }

        private List<String> readEvidencePaths(String rawEvidencePath) {
                if (rawEvidencePath == null || rawEvidencePath.isBlank()) {
                        return List.of();
                }

                return Arrays.stream(rawEvidencePath.split(";"))
                                .map(String::trim)
                                .filter(path -> !path.isBlank())
                                .toList();
        }

        private List<TechnicianUsedMedicineItemResponse> loadUsedMedicines(
                        Prescription prescription,
                        List<PrescriptionDetail> details
        ) {
                if (prescription == null || details == null || details.isEmpty()) {
                        return List.of();
                }

                return details.stream()
                                .sorted(Comparator.comparingLong(PrescriptionDetail::getId))
                                .map(detail -> TechnicianUsedMedicineItemResponse.builder()
                                                .medicineId(detail.getMedicine() == null ? null : detail.getMedicine().getId())
                                                .medicineName(detail.getMedicine() == null ? null : detail.getMedicine().getName())
                                                .description(detail.getMedicine() == null ? null : detail.getMedicine().getDescription())
                                                .quantity(detail.getQuantity())
                                                .dosageUnit(detail.getDosageUnit())
                                                .instruction(detail.getInstruction())
                                                .build())
                                .toList();
        }

    @Override
    @Transactional
    public ReceptionRecord updateReceptionSlip(long id, UpdateReceptionSlipRequest request) {
                ReceptionRecord record = receptionRecordRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));


                if (request.getExamReason() != null && !request.getExamReason().isBlank()) {
                        record.setExamReason(request.getExamReason().trim());
                }

                // symptomDescription field removed; use examReason for storing reason/description
                if (request.getNote() != null) {
                        record.setNote(request.getNote());
                }
                if (request.getWeight() != null) {
                        record.setWeight(request.getWeight());
                }
                if (request.getStatus() != null) {
                        record.setStatus(request.getStatus());
                }
                if (request.getDoctorId() != null) {
                        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                        record.setDoctor(doctor);
                }

                if (record.getStatus() == ReceptionStatus.IN_PROGRESS) {
                        ensureDefaultClinicalService(record);
                }

                return receptionRecordRepository.save(record);
        }

        private void ensureDefaultClinicalService(ReceptionRecord receptionRecord) {
                Doctor assignedDoctor = receptionRecord.getDoctor();
                if (assignedDoctor == null) {
                        throw new AppException(ErrorCode.ERROR_INPUT);
                }

                MedicalRecord medicalRecord = medicalRecordRepository.findByReceptionRecordId(receptionRecord.getId())
                        .orElseGet(() -> medicalRecordRepository.save(
                                MedicalRecord.builder()
                                        .receptionRecord(receptionRecord)
                                        .doctor(assignedDoctor)
                                        .status(resolveDefaultExamStatus())
                                        .examDate(LocalDateTime.now())
                                        .build()
                        ));

                com.petical.entity.Service clinicalService = serviceRepository.findById(DEFAULT_SERVICE_ID)
                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

                List<com.petical.entity.ReceptionService> existingServices = receptionServiceRepository.findByReceptionRecordId(receptionRecord.getId());
                com.petical.entity.ReceptionService existingClinicalService = existingServices.stream()
                        .filter(item -> item.getService() != null && item.getService().getId() == clinicalService.getId())
                        .findFirst()
                        .orElse(null);

                if (existingClinicalService != null) {
                        if (existingClinicalService.getStatus() == null || existingClinicalService.getStatus() == ReceptionServiceStatus.PENDING) {
                                existingClinicalService.setStatus(ReceptionServiceStatus.IN_PROGRESS);
                        }
                        if (existingClinicalService.getStartedAt() == null) {
                                existingClinicalService.setStartedAt(LocalDateTime.now());
                        }
                        receptionServiceRepository.save(existingClinicalService);
                        return;
                }

                com.petical.entity.ReceptionService receptionService = com.petical.entity.ReceptionService.builder()
                        .receptionRecord(receptionRecord)
                        .service(clinicalService)
                        .status(ReceptionServiceStatus.IN_PROGRESS)
                        .startedAt(LocalDateTime.now())
                        .build();
                receptionServiceRepository.save(receptionService);
        }

        private void ensureDefaultClinicalServicePending(ReceptionRecord receptionRecord) {
                com.petical.entity.Service clinicalService = serviceRepository.findById(DEFAULT_SERVICE_ID)
                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

                if (receptionServiceRepository.existsByReceptionRecordIdAndServiceId(receptionRecord.getId(), clinicalService.getId())) {
                        return;
                }

                com.petical.entity.ReceptionService receptionService = com.petical.entity.ReceptionService.builder()
                        .receptionRecord(receptionRecord)
                        .service(clinicalService)
                        .status(ReceptionServiceStatus.PENDING)
                        .build();
                receptionServiceRepository.save(receptionService);
        }

        private ExamStatus resolveDefaultExamStatus() {
                return examStatusRepository.findFirstByNameIgnoreCase(DEFAULT_EXAM_STATUS_NAME)
                        .orElseGet(() -> examStatusRepository.save(
                                ExamStatus.builder()
                                        .name(DEFAULT_EXAM_STATUS_NAME)
                                        .build()
                        ));
        }
}
