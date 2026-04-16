package com.petical.service.impl;

import com.petical.dto.request.TechnicianRecordServiceResultRequest;
import com.petical.dto.request.TechnicianUsedMedicineItemRequest;
import com.petical.dto.response.TechnicianAssignedServiceItemResponse;
import com.petical.dto.response.TechnicianAssignedServiceListResponse;
import com.petical.dto.response.TechnicianServiceTaskDetailResponse;
import com.petical.dto.response.TechnicianUsedMedicineItemResponse;
import com.petical.entity.Doctor;
import com.petical.entity.ExamResult;
import com.petical.entity.MedicalRecord;
import com.petical.entity.Medicine;
import com.petical.entity.Pet;
import com.petical.entity.Prescription;
import com.petical.entity.PrescriptionDetail;
import com.petical.entity.ReceptionRecord;
import com.petical.entity.ReceptionService;
import com.petical.entity.ServiceOrder;
import com.petical.entity.ServiceResult;
import com.petical.entity.Technician;
import com.petical.entity.TreatmentDirection;
import com.petical.entity.User;
import com.petical.enums.ErrorCode;
import com.petical.enums.ReceptionServiceStatus;
import com.petical.enums.ReceptionStatus;
import com.petical.enums.TechnicianServiceTaskStatus;
import com.petical.errors.AppException;
import com.petical.repository.ExamResultRepository;
import com.petical.repository.MedicineRepository;
import com.petical.repository.PrescriptionDetailRepository;
import com.petical.repository.PrescriptionRepository;
import com.petical.repository.ReceptionRecordRepository;
import com.petical.repository.ReceptionServiceRepository;
import com.petical.repository.ServiceOrderRepository;
import com.petical.repository.ServiceResultRepository;
import com.petical.repository.TechnicianRepository;
import com.petical.repository.TreatmentDirectionRepository;
import com.petical.service.SseNotificationService;
import com.petical.service.TechnicianWorkService;
import com.petical.dto.response.NotificationMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
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
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechnicianWorkServiceImpl implements TechnicianWorkService {

    private static final String DEFAULT_TECH_TREATMENT_DIRECTION = "Khám cận lâm sàng";
    private static final Path TECH_RESULT_STORAGE_DIR = Paths.get("storage", "tech-results");

    private final ServiceOrderRepository serviceOrderRepository;
    private final ServiceResultRepository serviceResultRepository;
    private final TechnicianRepository technicianRepository;
    private final ReceptionRecordRepository receptionRecordRepository;
    private final ReceptionServiceRepository receptionServiceRepository;
    private final ExamResultRepository examResultRepository;
    private final TreatmentDirectionRepository treatmentDirectionRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final MedicineRepository medicineRepository;
    private final SseNotificationService sseNotificationService;

    @Override
    @Transactional(readOnly = true)
    public TechnicianAssignedServiceListResponse getAssignedServices(long technicianId, TechnicianServiceTaskStatus status, String keyword) {
        if (!technicianRepository.existsById(technicianId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim().toLowerCase();

        List<ServiceOrder> orders = serviceOrderRepository.findByTechnicianId(technicianId)
                .stream()
                .filter(order -> isMatchKeyword(order, normalizedKeyword))
                .toList();

        Map<Long, ServiceResult> resultByOrderId = serviceResultRepository.findByServiceOrderIdIn(
                        orders.stream().map(ServiceOrder::getId).toList())
                .stream()
                .collect(Collectors.toMap(result -> result.getServiceOrder().getId(), Function.identity(), (left, right) -> left));

        List<TechnicianAssignedServiceItemResponse> allItems = orders.stream()
                .map(order -> toItem(order, resultByOrderId.get(order.getId())))
                .sorted(Comparator.comparingLong(TechnicianAssignedServiceItemResponse::getServiceOrderId).reversed())
                .toList();

        long waitingCount = allItems.stream().filter(item -> item.getStatus() == TechnicianServiceTaskStatus.WAITING_EXECUTION).count();
        long inProgressCount = allItems.stream().filter(item -> item.getStatus() == TechnicianServiceTaskStatus.IN_PROGRESS).count();
        long completedCount = allItems.stream().filter(item -> item.getStatus() == TechnicianServiceTaskStatus.COMPLETED).count();

        List<TechnicianAssignedServiceItemResponse> filteredItems = status == null
                ? allItems
                : allItems.stream().filter(item -> item.getStatus() == status).toList();

        return TechnicianAssignedServiceListResponse.builder()
                .technicianId(technicianId)
                .waitingCount(waitingCount)
                .inProgressCount(inProgressCount)
                .completedCount(completedCount)
                .totalCount(allItems.size())
                .items(filteredItems)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TechnicianAssignedServiceListResponse getMyAssignedServices(TechnicianServiceTaskStatus status, String keyword) {
        Technician technician = resolveCurrentTechnician();
        return getAssignedServices(technician.getId(), status, keyword);
    }

    @Override
    @Transactional(readOnly = true)
    public TechnicianServiceTaskDetailResponse getMyAssignedServiceDetail(long serviceOrderId) {
        ServiceOrder order = getOwnedServiceOrder(serviceOrderId);
        ServiceResult result = serviceResultRepository.findByServiceOrderId(order.getId()).orElse(null);
        return toDetail(order, result);
    }

    @Override
    @Transactional
    public TechnicianServiceTaskDetailResponse startMyAssignedService(long serviceOrderId) {
        ServiceOrder order = getOwnedServiceOrder(serviceOrderId);
        ServiceResult result = serviceResultRepository.findByServiceOrderId(order.getId())
                .orElseGet(() -> ServiceResult.builder().serviceOrder(order).build());

        if (result.getEndTime() == null) {
            if (result.getStartTime() == null) {
                result.setStartTime(LocalDateTime.now());
            }
            result = serviceResultRepository.save(result);
            updateReceptionStatusesOnStart(order);
        }

        return toDetail(order, result);
    }

    @Override
    @Transactional
    public TechnicianServiceTaskDetailResponse recordMyAssignedServiceResult(
            long serviceOrderId,
            TechnicianRecordServiceResultRequest request,
            List<MultipartFile> images
    ) {
        ServiceOrder order = getOwnedServiceOrder(serviceOrderId);
        TechnicianRecordServiceResultRequest safeRequest = request == null
                ? TechnicianRecordServiceResultRequest.builder().build()
                : request;

        ServiceResult result = serviceResultRepository.findByServiceOrderId(order.getId())
                .orElseGet(() -> ServiceResult.builder().serviceOrder(order).build());

        if (result.getStartTime() == null) {
            result.setStartTime(LocalDateTime.now());
        }

        if (safeRequest.getResult() != null) {
            String normalizedResult = safeRequest.getResult().trim();
            result.setResult(normalizedResult.isBlank() ? null : normalizedResult);
        }

        List<String> mergedEvidencePaths = new ArrayList<>(readEvidencePaths(result.getEvidencePath()));
        mergedEvidencePaths.addAll(storeEvidenceFiles(images));
        if (!mergedEvidencePaths.isEmpty()) {
            result.setEvidencePath(joinEvidencePaths(mergedEvidencePaths));
        }

        result.setEndTime(LocalDateTime.now());
        result = serviceResultRepository.save(result);

        upsertUsedMedicines(order, safeRequest.getMedicines());
        updateReceptionStatusesOnComplete(order);

        Doctor assignedDoctor = order.getMedicalRecord().getDoctor();
        if (assignedDoctor != null) {
            sseNotificationService.sendNotificationToUser(assignedDoctor.getId(),
                    NotificationMessage.builder()
                            .title("Kết quả dịch vụ đã cập nhật")
                            .message("KTV đã cập nhật kết quả dịch vụ " + order.getService().getName() + " cho thú cưng " + order.getMedicalRecord().getReceptionRecord().getPet().getName())
                            .timestamp(LocalDateTime.now())
                            .type("TECH_RESULT")
                            .build());
        }

        return toDetail(order, result);
    }

    private Technician resolveCurrentTechnician() {
        User principal = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof Technician technician)) {
            throw new AppException(ErrorCode.NO_PERMISSION);
        }
        return technician;
    }

    private ServiceOrder getOwnedServiceOrder(long serviceOrderId) {
        ServiceOrder order = serviceOrderRepository.findById(serviceOrderId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Technician technician = resolveCurrentTechnician();
        if (order.getTechnician() == null || order.getTechnician().getId() != technician.getId()) {
            throw new AppException(ErrorCode.NO_PERMISSION);
        }

        return order;
    }

    private boolean isMatchKeyword(ServiceOrder order, String keyword) {
        if (keyword == null) {
            return true;
        }
        String serviceName = order.getService() == null ? null : order.getService().getName();
        return serviceName != null && serviceName.toLowerCase().contains(keyword);
    }

    private TechnicianAssignedServiceItemResponse toItem(ServiceOrder order, ServiceResult result) {
        Doctor doctor = order.getMedicalRecord() == null ? null : order.getMedicalRecord().getDoctor();
        ReceptionRecord receptionRecord = order.getMedicalRecord() == null ? null : order.getMedicalRecord().getReceptionRecord();
        Pet pet = receptionRecord == null ? null : receptionRecord.getPet();

        return TechnicianAssignedServiceItemResponse.builder()
                .serviceOrderId(order.getId())
                .serviceId(order.getService().getId())
                .serviceName(order.getService().getName())
                .petId(pet == null ? null : pet.getId())
                .petName(pet == null ? null : pet.getName())
                .prescribedByDoctorId(doctor == null ? null : doctor.getId())
                .prescribedByDoctorName(doctor == null ? null : doctor.getFullName())
                .status(deriveStatus(result))
                .startTime(result == null ? null : result.getStartTime())
                .endTime(result == null ? null : result.getEndTime())
                .build();
    }

    private TechnicianServiceTaskDetailResponse toDetail(ServiceOrder order, ServiceResult result) {
        TechnicianAssignedServiceItemResponse item = toItem(order, result);

        return TechnicianServiceTaskDetailResponse.builder()
                .serviceOrderId(item.getServiceOrderId())
                .serviceId(item.getServiceId())
                .serviceName(item.getServiceName())
                .petId(item.getPetId())
                .petName(item.getPetName())
                .prescribedByDoctorId(item.getPrescribedByDoctorId())
                .prescribedByDoctorName(item.getPrescribedByDoctorName())
                .status(item.getStatus())
                .startTime(item.getStartTime())
                .endTime(item.getEndTime())
                .result(result == null ? null : result.getResult())
                .evidencePaths(result == null ? List.of() : readEvidencePaths(result.getEvidencePath()))
                .medicines(loadUsedMedicines(order))
                .build();
    }

    private TechnicianServiceTaskStatus deriveStatus(ServiceResult result) {
        if (result == null) {
            return TechnicianServiceTaskStatus.WAITING_EXECUTION;
        }
        if (Objects.nonNull(result.getEndTime())) {
            return TechnicianServiceTaskStatus.COMPLETED;
        }
        if (Objects.nonNull(result.getStartTime())) {
            return TechnicianServiceTaskStatus.IN_PROGRESS;
        }
        return TechnicianServiceTaskStatus.WAITING_EXECUTION;
    }

    private ReceptionService resolveReceptionService(ServiceOrder order) {
        if (order == null || order.getMedicalRecord() == null || order.getMedicalRecord().getReceptionRecord() == null || order.getService() == null) {
            return null;
        }

        long receptionRecordId = order.getMedicalRecord().getReceptionRecord().getId();
        long serviceId = order.getService().getId();
        return receptionServiceRepository.findFirstByReceptionRecordIdAndServiceIdOrderByIdAsc(receptionRecordId, serviceId)
                .orElse(null);
    }

    private void updateReceptionStatusesOnStart(ServiceOrder order) {
        ReceptionService receptionService = resolveReceptionService(order);
        if (receptionService != null) {
            if (receptionService.getStatus() == null || receptionService.getStatus() == ReceptionServiceStatus.PENDING) {
                receptionService.setStatus(ReceptionServiceStatus.IN_PROGRESS);
            }
            if (receptionService.getStartedAt() == null) {
                receptionService.setStartedAt(LocalDateTime.now());
            }
            receptionServiceRepository.save(receptionService);
        }

        MedicalRecord medicalRecord = order.getMedicalRecord();
        ReceptionRecord receptionRecord = medicalRecord == null ? null : medicalRecord.getReceptionRecord();
        if (receptionRecord != null && receptionRecord.getStatus() == ReceptionStatus.WAITING_EXECUTION) {
            receptionRecord.setStatus(ReceptionStatus.IN_PROGRESS);
            receptionRecordRepository.save(receptionRecord);
        }
    }

    private void updateReceptionStatusesOnComplete(ServiceOrder order) {
        ReceptionService receptionService = resolveReceptionService(order);
        if (receptionService != null) {
            receptionService.setStatus(ReceptionServiceStatus.COMPLETED);
            if (receptionService.getStartedAt() == null) {
                receptionService.setStartedAt(LocalDateTime.now());
            }
            receptionServiceRepository.save(receptionService);
        }

        MedicalRecord medicalRecord = order.getMedicalRecord();
        ReceptionRecord receptionRecord = medicalRecord == null ? null : medicalRecord.getReceptionRecord();
        if (receptionRecord == null) {
            return;
        }

        List<ReceptionService> allServices = receptionServiceRepository.findByReceptionRecordId(receptionRecord.getId());
        boolean allCompleted = !allServices.isEmpty()
                && allServices.stream().allMatch(service -> service.getStatus() == ReceptionServiceStatus.COMPLETED);

        if (allCompleted
                && receptionRecord.getStatus() != ReceptionStatus.PAID
                && receptionRecord.getStatus() != ReceptionStatus.WAITING_PAYMENT) {
            receptionRecord.setStatus(ReceptionStatus.WAITING_CONCLUSION);
        } else if (receptionRecord.getStatus() == ReceptionStatus.WAITING_EXECUTION) {
            receptionRecord.setStatus(ReceptionStatus.IN_PROGRESS);
        }

        receptionRecordRepository.save(receptionRecord);
    }

    private List<TechnicianUsedMedicineItemResponse> loadUsedMedicines(ServiceOrder order) {
        ReceptionService receptionService = resolveReceptionService(order);
        if (receptionService == null) {
            return List.of();
        }

        Prescription prescription = prescriptionRepository.findByReceptionServiceId(receptionService.getId()).orElse(null);
        if (prescription == null) {
            return List.of();
        }

        List<PrescriptionDetail> details = prescriptionDetailRepository.findByPrescriptionIdIn(List.of(prescription.getId()));
        return details.stream()
                .filter(detail -> isMaterial(detail.getMedicine()))
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

    private void upsertUsedMedicines(ServiceOrder order, List<TechnicianUsedMedicineItemRequest> medicineItems) {
        ReceptionService receptionService = resolveReceptionService(order);
        if (receptionService == null) {
            return;
        }

        ExamResult examResult = resolveOrCreateExamResult(order);

        Prescription prescription = prescriptionRepository.findByReceptionServiceId(receptionService.getId())
                .orElseGet(() -> prescriptionRepository.save(Prescription.builder()
                        .examResult(examResult)
                        .receptionService(receptionService)
                        .build()));

        if (prescription.getExamResult() == null) {
            prescription.setExamResult(examResult);
            prescriptionRepository.save(prescription);
        }

        prescriptionDetailRepository.deleteByPrescriptionId(prescription.getId());

        if (medicineItems == null || medicineItems.isEmpty()) {
            return;
        }

        for (TechnicianUsedMedicineItemRequest item : medicineItems) {
            if (item == null || item.getMedicineId() == null || item.getMedicineId() <= 0) {
                continue;
            }

            int quantity = item.getQuantity() == null ? 0 : item.getQuantity();
            if (quantity <= 0) {
                continue;
            }

            Medicine medicine = medicineRepository.findById(item.getMedicineId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            if (!isMaterial(medicine)) {
                continue;
            }

            prescriptionDetailRepository.save(PrescriptionDetail.builder()
                    .prescription(prescription)
                    .medicine(medicine)
                    .quantity(quantity)
                    .morning(resolveDose(item.getMorning()))
                    .noon(resolveDose(item.getNoon()))
                    .afternoon(resolveDose(item.getAfternoon()))
                    .evening(resolveDose(item.getEvening()))
                    .instruction(normalizeNullableText(item.getInstruction()))
                    .dosageUnit(resolveDosageUnit(item.getDosageUnit(), medicine.getUnit()))
                    .build());
        }
    }

    private boolean isMaterial(Medicine medicine) {
        String type = medicine == null || medicine.getType() == null
                ? ""
                : medicine.getType().trim().toUpperCase(Locale.ROOT);
        return "VAT_TU".equals(type)
                || "MATERIAL".equals(type)
                || "SUPPLY".equals(type);
    }

    private ExamResult resolveOrCreateExamResult(ServiceOrder order) {
        MedicalRecord medicalRecord = order.getMedicalRecord();
        if (medicalRecord == null) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        TreatmentDirection defaultDirection = treatmentDirectionRepository.findFirstByNameIgnoreCase(DEFAULT_TECH_TREATMENT_DIRECTION)
                .orElseGet(() -> treatmentDirectionRepository.save(TreatmentDirection.builder().name(DEFAULT_TECH_TREATMENT_DIRECTION).build()));

        ExamResult examResult = examResultRepository.findFirstByMedicalRecordIdOrderByIdDesc(medicalRecord.getId())
                .orElseGet(() -> examResultRepository.save(ExamResult.builder()
                        .medicalRecord(medicalRecord)
                        .treatmentDirection(defaultDirection)
                        .startTime(LocalDateTime.now())
                        .build()));

        if (examResult.getTreatmentDirection() == null) {
            examResult.setTreatmentDirection(defaultDirection);
            examResult = examResultRepository.save(examResult);
        }

        return examResult;
    }

    private int resolveDose(Integer value) {
        return value == null ? 0 : Math.max(0, value);
    }

    private String normalizeNullableText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private String resolveDosageUnit(String requested, String fallback) {
        String resolved = requested == null || requested.isBlank() ? fallback : requested;
        if (resolved == null) {
            return null;
        }
        return resolved.trim().replaceFirst("^/", "");
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

    private String joinEvidencePaths(List<String> paths) {
        Set<String> unique = new LinkedHashSet<>(paths);
        return unique.stream()
                .map(String::trim)
                .filter(path -> !path.isBlank())
                .collect(Collectors.joining(";"));
    }

    private List<String> storeEvidenceFiles(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return List.of();
        }

        List<String> saved = new ArrayList<>();
        try {
            Files.createDirectories(TECH_RESULT_STORAGE_DIR);
            for (MultipartFile image : images) {
                if (image == null || image.isEmpty()) {
                    continue;
                }

                String extension = extractExtension(image.getOriginalFilename());
                String fileName = "tech-result-" + System.currentTimeMillis() + "-" + UUID.randomUUID() + extension;
                Path destination = TECH_RESULT_STORAGE_DIR.resolve(fileName);
                Files.copy(image.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                saved.add("./" + TECH_RESULT_STORAGE_DIR.resolve(fileName).toString().replace("\\", "/"));
            }
            return saved;
        } catch (IOException exception) {
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
