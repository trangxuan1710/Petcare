package com.petical.service.impl;

import com.petical.dto.request.AddExamPrescriptionItemRequest;
import com.petical.dto.request.RecordExamResultRequest;
import com.petical.dto.response.RecordExamResultResponse;
import com.petical.entity.Doctor;
import com.petical.entity.ExamResult;
import com.petical.entity.ExamStatus;
import com.petical.entity.MedicalRecord;
import com.petical.entity.Medicine;
import com.petical.entity.Prescription;
import com.petical.entity.PrescriptionDetail;
import com.petical.entity.ReceptionRecord;
import com.petical.entity.ReceptionService;
import com.petical.entity.TreatmentDirection;
import com.petical.enums.ErrorCode;
import com.petical.enums.ReceptionServiceStatus;
import com.petical.enums.ReceptionStatus;
import com.petical.enums.TreatmentDecision;
import com.petical.errors.AppException;
import com.petical.repository.DoctorRepository;
import com.petical.repository.ExamResultRepository;
import com.petical.repository.ExamStatusRepository;
import com.petical.repository.MedicalRecordRepository;
import com.petical.repository.MedicineRepository;
import com.petical.repository.PrescriptionDetailRepository;
import com.petical.repository.PrescriptionRepository;
import com.petical.repository.ReceptionRecordRepository;
import com.petical.repository.ReceptionServiceRepository;
import com.petical.repository.ServiceRepository;
import com.petical.repository.TreatmentDirectionRepository;
import com.petical.service.ExamResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExamResultServiceImpl implements ExamResultService {
    private static final String DEFAULT_EXAM_STATUS_NAME = "IN_PROGRESS";
    private static final String DEFAULT_TREATMENT_DIRECTION_NAME = "Cho về";
    private static final long DEFAULT_CLINICAL_SERVICE_ID = 1L;
    private static final Path EXAM_RESULT_STORAGE_DIR = Paths.get("storage", "exam-results");

    private final ReceptionRecordRepository receptionRecordRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ExamStatusRepository examStatusRepository;
    private final ExamResultRepository examResultRepository;
    private final TreatmentDirectionRepository treatmentDirectionRepository;
    private final ServiceRepository serviceRepository;
    private final ReceptionServiceRepository receptionServiceRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final MedicineRepository medicineRepository;

    @Override
    @Transactional
    public RecordExamResultResponse recordResult(long receptionRecordId, RecordExamResultRequest request, List<MultipartFile> images) {
        if (request == null) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }

        ReceptionRecord receptionRecord = receptionRecordRepository.findById(receptionRecordId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (receptionRecord.getStatus() == ReceptionStatus.PAID) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }

        if (receptionRecord.getStatus() == null) {
            receptionRecord.setStatus(ReceptionStatus.WAITING_EXECUTION);
        }

        Doctor doctor = resolveDoctor(receptionRecord, request.getDoctorId());
        receptionRecord.setDoctor(doctor);

        MedicalRecord medicalRecord = medicalRecordRepository.findByReceptionRecordId(receptionRecordId)
                .orElseGet(() -> medicalRecordRepository.save(MedicalRecord.builder()
                        .receptionRecord(receptionRecord)
                        .doctor(doctor)
                        .status(resolveDefaultExamStatus())
                        .examDate(LocalDateTime.now())
                        .build()));

        medicalRecord.setDoctor(doctor);
        if (request.getExamDate() != null) {
            medicalRecord.setExamDate(request.getExamDate());
        } else if (medicalRecord.getExamDate() == null) {
            medicalRecord.setExamDate(LocalDateTime.now());
        }
        medicalRecordRepository.save(medicalRecord);

        ExamResult examResult = examResultRepository.findFirstByMedicalRecordId(medicalRecord.getId())
                .orElseGet(() -> ExamResult.builder().medicalRecord(medicalRecord).build());
        examResult.setTreatmentDirection(resolveTreatmentDirection(request));
        examResult.setConclusion(request.getConclusion());
        examResult.setStartTime(request.getStartTime() == null ? LocalDateTime.now() : request.getStartTime());
        examResult.setEndTime(request.getEndTime());

        List<String> savedEvidencePaths = storeEvidenceFiles(images);
        if (!savedEvidencePaths.isEmpty()) {
            examResult.setEvidencePath(String.join(";", savedEvidencePaths));
        }
        examResult = examResultRepository.save(examResult);

        int serviceCount = upsertReceptionServices(receptionRecord, request.getServiceIds());
        Prescription prescription = upsertPrescription(receptionRecord, examResult, request.getMedicines());
        int medicineCount = request.getMedicines() == null ? 0 : request.getMedicines().size();

        boolean discharge = request.getTreatmentDecision() == TreatmentDecision.DISCHARGE
                || Boolean.TRUE.equals(request.getConfirmDischarge());
        TreatmentDecision appliedDecision = request.getTreatmentDecision();
        if (appliedDecision == null && discharge) {
            appliedDecision = TreatmentDecision.DISCHARGE;
        }

        if (discharge) {
            receptionRecord.setStatus(ReceptionStatus.WAITING_PAYMENT);
        } else if (receptionRecord.getStatus() == null || receptionRecord.getStatus() == ReceptionStatus.WAITING_EXECUTION) {
            receptionRecord.setStatus(ReceptionStatus.IN_PROGRESS);
        }
        syncReceptionServiceStatuses(receptionRecord, appliedDecision);
        receptionRecordRepository.save(receptionRecord);

        return RecordExamResultResponse.builder()
                .receptionRecordId(receptionRecord.getId())
                .medicalRecordId(medicalRecord.getId())
                .examResultId(examResult.getId())
                .treatmentDecision(appliedDecision)
                .prescriptionId(prescription == null ? null : prescription.getId())
                .evidencePaths(readEvidencePaths(examResult.getEvidencePath()))
                .serviceCount(serviceCount)
                .medicineCount(medicineCount)
                .receptionStatus(receptionRecord.getStatus())
                .build();
    }

    private Doctor resolveDoctor(ReceptionRecord receptionRecord, Long doctorId) {
        Long resolvedDoctorId = doctorId;
        if (resolvedDoctorId == null || resolvedDoctorId <= 0) {
            resolvedDoctorId = receptionRecord.getDoctor() == null ? null : receptionRecord.getDoctor().getId();
        }
        if (resolvedDoctorId == null || resolvedDoctorId <= 0) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }

        return doctorRepository.findById(resolvedDoctorId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private ExamStatus resolveDefaultExamStatus() {
        return examStatusRepository.findFirstByNameIgnoreCase(DEFAULT_EXAM_STATUS_NAME)
                .orElseGet(() -> examStatusRepository.save(ExamStatus.builder().name(DEFAULT_EXAM_STATUS_NAME).build()));
    }

    private TreatmentDirection resolveTreatmentDirection(RecordExamResultRequest request) {
        if (request.getTreatmentDecision() != null) {
            String directionName = mapTreatmentDecisionToDirectionName(request.getTreatmentDecision());
            return treatmentDirectionRepository.findFirstByNameIgnoreCase(directionName)
                    .orElseGet(() -> treatmentDirectionRepository.save(TreatmentDirection.builder().name(directionName).build()));
        }

        if (request.getTreatmentDirectionId() != null && request.getTreatmentDirectionId() > 0) {
            return treatmentDirectionRepository.findById(request.getTreatmentDirectionId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        }

        if (request.getTreatmentDirectionName() != null && !request.getTreatmentDirectionName().isBlank()) {
            String normalizedName = request.getTreatmentDirectionName().trim();
            return treatmentDirectionRepository.findFirstByNameIgnoreCase(normalizedName)
                    .orElseGet(() -> treatmentDirectionRepository.save(TreatmentDirection.builder().name(normalizedName).build()));
        }

        return treatmentDirectionRepository.findFirstByNameIgnoreCase(DEFAULT_TREATMENT_DIRECTION_NAME)
                .orElseGet(() -> treatmentDirectionRepository.save(TreatmentDirection.builder().name(DEFAULT_TREATMENT_DIRECTION_NAME).build()));
    }

    private String mapTreatmentDecisionToDirectionName(TreatmentDecision decision) {
        return switch (decision) {
            case DISCHARGE -> "Cho về";
            case INPATIENT_TREATMENT -> "Điều trị nội trú";
            case OUTPATIENT_TREATMENT -> "Điều trị ngoại trú";
            case PARACLINICAL_EXAM -> "Khám cận lâm sàng";
        };
    }

    private void syncReceptionServiceStatuses(ReceptionRecord receptionRecord, TreatmentDecision treatmentDecision) {
        List<ReceptionService> receptionServices = receptionServiceRepository.findByReceptionRecordId(receptionRecord.getId());
        if (receptionServices.isEmpty()) {
            return;
        }

        boolean completeClinicalService = treatmentDecision == TreatmentDecision.PARACLINICAL_EXAM
                || treatmentDecision == TreatmentDecision.DISCHARGE;
        for (ReceptionService receptionService : receptionServices) {
            if (receptionService.getService() != null && receptionService.getService().getId() == DEFAULT_CLINICAL_SERVICE_ID) {
                receptionService.setStatus(completeClinicalService ? ReceptionServiceStatus.COMPLETED : ReceptionServiceStatus.IN_PROGRESS);
                continue;
            }

            if (receptionService.getStatus() == null) {
                receptionService.setStatus(ReceptionServiceStatus.PENDING);
            }
        }

        receptionServiceRepository.saveAll(receptionServices);
    }

    private int upsertReceptionServices(ReceptionRecord receptionRecord, List<Long> serviceIds) {
        if (serviceIds == null || serviceIds.isEmpty()) {
            return 0;
        }

        int attached = 0;
        for (Long serviceId : serviceIds) {
            if (serviceId == null || serviceId <= 0) {
                continue;
            }
            if (receptionServiceRepository.existsByReceptionRecordIdAndServiceId(receptionRecord.getId(), serviceId)) {
                attached++;
                continue;
            }

            com.petical.entity.Service service = serviceRepository.findById(serviceId)
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
                ReceptionServiceStatus initialStatus = service.getId() == DEFAULT_CLINICAL_SERVICE_ID
                    ? ReceptionServiceStatus.IN_PROGRESS
                    : ReceptionServiceStatus.PENDING;
            receptionServiceRepository.save(ReceptionService.builder()
                    .receptionRecord(receptionRecord)
                    .service(service)
                    .status(initialStatus)
                    .build());
            attached++;
        }
        return attached;
    }

    private Prescription upsertPrescription(ReceptionRecord receptionRecord, ExamResult examResult, List<AddExamPrescriptionItemRequest> medicines) {
        if (medicines == null || medicines.isEmpty()) {
            return null;
        }

        Map<Long, Prescription> prescriptionByOwnerServiceId = new LinkedHashMap<>();
        Map<Long, Boolean> detailClearedByPrescriptionId = new LinkedHashMap<>();
        Prescription firstPrescription = null;

        for (AddExamPrescriptionItemRequest item : medicines) {
            int soldQuantity = resolveSoldQuantity(item);
            if (item.getMedicineId() == null || item.getMedicineId() <= 0 || soldQuantity <= 0) {
                throw new AppException(ErrorCode.ERROR_INPUT);
            }

            ReceptionService ownerService = resolvePrescriptionOwnerService(receptionRecord, item.getServiceId());
            long ownerServiceId = ownerService == null ? -1L : ownerService.getId();

            Prescription prescription = prescriptionByOwnerServiceId.get(ownerServiceId);
            if (prescription == null) {
                if (ownerService != null) {
                    prescription = prescriptionRepository.findByReceptionServiceId(ownerService.getId())
                            .orElseGet(() -> prescriptionRepository.save(Prescription.builder()
                                    .examResult(examResult)
                                    .receptionService(ownerService)
                                    .build()));
                } else {
                    prescription = prescriptionRepository.findByExamResultIdIn(List.of(examResult.getId()))
                        .stream()
                        .findFirst()
                        .orElseGet(() -> prescriptionRepository.save(Prescription.builder()
                            .examResult(examResult)
                            .build()));
                }

                if (prescription.getReceptionService() == null && ownerService != null) {
                    prescription.setReceptionService(ownerService);
                    prescription = prescriptionRepository.save(prescription);
                }

                prescriptionByOwnerServiceId.put(ownerServiceId, prescription);
            }

            if (!detailClearedByPrescriptionId.getOrDefault(prescription.getId(), false)) {
                prescriptionDetailRepository.deleteByPrescriptionId(prescription.getId());
                detailClearedByPrescriptionId.put(prescription.getId(), true);
            }

            if (firstPrescription == null) {
                firstPrescription = prescription;
            }

            Medicine medicine = medicineRepository.findById(item.getMedicineId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

            prescriptionDetailRepository.save(PrescriptionDetail.builder()
                    .prescription(prescription)
                    .medicine(medicine)
                    .quantity(soldQuantity)
                    .morning(resolveDoseValue(item.getMorning()))
                    .noon(resolveDoseValue(item.getNoon()))
                    .afternoon(resolveDoseValue(item.getAfternoon()))
                    .evening(resolveDoseValue(item.getEvening()))
                    .instruction(item.getInstruction() == null ? null : item.getInstruction().trim())
                    .dosageUnit(resolveDosageUnit(item.getDosageUnit(), medicine.getUnit()))
                    .build());
        }

        return firstPrescription;
    }

    private ReceptionService resolvePrescriptionOwnerService(ReceptionRecord receptionRecord, Long requestedServiceId) {
        if (receptionRecord == null || receptionRecord.getId() <= 0) {
            return null;
        }

        if (requestedServiceId != null && requestedServiceId > 0) {
            ReceptionService requested = receptionServiceRepository.findFirstByReceptionRecordIdAndServiceIdOrderByIdAsc(
                    receptionRecord.getId(),
                    requestedServiceId
            ).orElse(null);
            if (requested != null) {
                return requested;
            }
        }

        return receptionServiceRepository.findFirstByReceptionRecordIdAndServiceIdOrderByIdAsc(
                        receptionRecord.getId(),
                        DEFAULT_CLINICAL_SERVICE_ID
                )
                .orElseGet(() -> receptionServiceRepository.findByReceptionRecordId(receptionRecord.getId())
                        .stream()
                        .findFirst()
                        .orElse(null));
    }

    private int resolveSoldQuantity(AddExamPrescriptionItemRequest item) {
        if (item.getSoldQuantity() != null && item.getSoldQuantity() > 0) {
            return item.getSoldQuantity();
        }
        return item.getQuantity() == null ? 0 : item.getQuantity();
    }

    private int resolveDoseValue(int rawDose) {
        return Math.max(0, rawDose);
    }

    private String resolveDosageUnit(String requestedUnit, String fallbackUnit) {
        String value = requestedUnit == null || requestedUnit.isBlank() ? fallbackUnit : requestedUnit;
        if (value == null) {
            return null;
        }
        return value.trim().replaceFirst("^/", "");
    }

    private List<String> readEvidencePaths(String rawEvidencePath) {
        if (rawEvidencePath == null || rawEvidencePath.isBlank()) {
            return List.of();
        }

        return java.util.Arrays.stream(rawEvidencePath.split(";"))
                .map(String::trim)
                .filter(path -> !path.isBlank())
                .toList();
    }

    private List<String> storeEvidenceFiles(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return List.of();
        }

        List<String> saved = new ArrayList<>();
        try {
            Files.createDirectories(EXAM_RESULT_STORAGE_DIR);
            for (MultipartFile image : images) {
                if (image == null || image.isEmpty()) {
                    continue;
                }

                String originalName = image.getOriginalFilename();
                String extension = extractExtension(originalName);
                String fileName = "exam-result-" + System.currentTimeMillis() + "-" + UUID.randomUUID() + extension;
                Path destination = EXAM_RESULT_STORAGE_DIR.resolve(fileName);
                Files.copy(image.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                saved.add("./" + EXAM_RESULT_STORAGE_DIR.resolve(fileName).toString().replace("\\", "/"));
            }
            return saved;
        } catch (IOException e) {
            throw new AppException(ErrorCode.SERVER_ERROR);
        }
    }

    private String extractExtension(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "";
        }
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex);
    }
}
