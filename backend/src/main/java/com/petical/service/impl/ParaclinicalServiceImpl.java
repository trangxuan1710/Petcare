package com.petical.service.impl;

import com.petical.dto.request.ParaclinicalServiceSelectionItemRequest;
import com.petical.dto.request.SaveParaclinicalServicesRequest;
import com.petical.dto.response.ParaclinicalSelectedServiceResponse;
import com.petical.dto.response.ParaclinicalServiceOptionResponse;
import com.petical.dto.response.SaveParaclinicalServicesResponse;
import com.petical.dto.response.TechnicianOptionResponse;
import com.petical.entity.Doctor;
import com.petical.entity.ExamStatus;
import com.petical.entity.MedicalRecord;
import com.petical.entity.ReceptionRecord;
import com.petical.entity.ReceptionService;
import com.petical.entity.ServiceOrder;
import com.petical.entity.Technician;
import com.petical.enums.ErrorCode;
import com.petical.enums.ReceptionServiceStatus;
import com.petical.errors.AppException;
import com.petical.repository.ExamStatusRepository;
import com.petical.repository.MedicalRecordRepository;
import com.petical.repository.ReceptionRecordRepository;
import com.petical.repository.ReceptionServiceRepository;
import com.petical.repository.ServiceOrderRepository;
import com.petical.repository.ServiceRepository;
import com.petical.repository.TechnicianRepository;
import com.petical.service.ParaclinicalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParaclinicalServiceImpl implements ParaclinicalService {
    private static final String DEFAULT_EXAM_STATUS_NAME = "IN_PROGRESS";

    private final TechnicianRepository technicianRepository;
    private final ServiceRepository serviceRepository;
    private final ReceptionRecordRepository receptionRecordRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ExamStatusRepository examStatusRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final ReceptionServiceRepository receptionServiceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TechnicianOptionResponse> searchTechnicians(String keyword, Integer limit) {
        int safeLimit = limit == null || limit <= 0 ? 20 : Math.min(limit, 100);
        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim();

        return technicianRepository.searchByName(normalizedKeyword)
                .stream()
                .limit(safeLimit)
                .map(technician -> TechnicianOptionResponse.builder()
                        .id(technician.getId())
                        .fullName(technician.getFullName())
                        .phoneNumber(technician.getPhoneNumber())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParaclinicalServiceOptionResponse> searchServices(String keyword, Integer limit) {
        int safeLimit = limit == null || limit <= 0 ? 20 : Math.min(limit, 100);
        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim();

        return serviceRepository.searchByName(normalizedKeyword)
                .stream()
                .limit(safeLimit)
                .map(service -> ParaclinicalServiceOptionResponse.builder()
                        .serviceId(service.getId())
                        .serviceName(service.getName())
                        .unitPrice(service.getUnitPrice())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public SaveParaclinicalServicesResponse saveSelectedServices(long receptionRecordId, SaveParaclinicalServicesRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }

        ReceptionRecord receptionRecord = receptionRecordRepository.findById(receptionRecordId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        MedicalRecord medicalRecord = medicalRecordRepository.findByReceptionRecordId(receptionRecordId)
                .orElseGet(() -> medicalRecordRepository.save(MedicalRecord.builder()
                        .receptionRecord(receptionRecord)
                        .doctor(resolveDoctor(receptionRecord))
                        .status(resolveDefaultExamStatus())
                        .examDate(LocalDateTime.now())
                        .build()));

        for (ParaclinicalServiceSelectionItemRequest item : request.getItems()) {
            if (item.getServiceId() == null || item.getServiceId() <= 0
                    || item.getTechnicianId() == null || item.getTechnicianId() <= 0) {
                throw new AppException(ErrorCode.ERROR_INPUT);
            }

            com.petical.entity.Service service = serviceRepository.findById(item.getServiceId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            Technician technician = technicianRepository.findById(item.getTechnicianId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

            if (!serviceOrderRepository.existsByMedicalRecordIdAndServiceIdAndTechnicianId(medicalRecord.getId(), service.getId(), technician.getId())) {
                serviceOrderRepository.save(ServiceOrder.builder()
                        .medicalRecord(medicalRecord)
                        .service(service)
                        .technician(technician)
                        .build());
            }

            if (!receptionServiceRepository.existsByReceptionRecordIdAndServiceId(receptionRecord.getId(), service.getId())) {
                receptionServiceRepository.save(ReceptionService.builder()
                        .receptionRecord(receptionRecord)
                        .service(service)
                                                .status(ReceptionServiceStatus.PENDING)
                        .build());
            }
        }

        List<ParaclinicalSelectedServiceResponse> selected = serviceOrderRepository.findByMedicalRecordId(medicalRecord.getId())
                .stream()
                .map(order -> ParaclinicalSelectedServiceResponse.builder()
                        .serviceOrderId(order.getId())
                        .serviceId(order.getService().getId())
                        .serviceName(order.getService().getName())
                        .unitPrice(order.getService().getUnitPrice())
                        .technicianId(order.getTechnician().getId())
                        .technicianName(order.getTechnician().getFullName())
                        .quantity(1)
                        .build())
                .toList();

        return SaveParaclinicalServicesResponse.builder()
                .receptionRecordId(receptionRecord.getId())
                .medicalRecordId(medicalRecord.getId())
                .totalSelected(selected.size())
                .selectedServices(selected)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParaclinicalSelectedServiceResponse> getSelectedServices(long receptionRecordId) {
        MedicalRecord medicalRecord = medicalRecordRepository.findByReceptionRecordId(receptionRecordId)
                .orElse(null);

        if (medicalRecord == null) {
            return List.of();
        }

        return serviceOrderRepository.findByMedicalRecordId(medicalRecord.getId())
                .stream()
                .map(order -> ParaclinicalSelectedServiceResponse.builder()
                        .serviceOrderId(order.getId())
                        .serviceId(order.getService().getId())
                        .serviceName(order.getService().getName())
                        .unitPrice(order.getService().getUnitPrice())
                        .technicianId(order.getTechnician().getId())
                        .technicianName(order.getTechnician().getFullName())
                        .quantity(1)
                        .build())
                .toList();
    }

    private Doctor resolveDoctor(ReceptionRecord receptionRecord) {
        if (receptionRecord.getDoctor() == null) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }
        return receptionRecord.getDoctor();
    }

    private ExamStatus resolveDefaultExamStatus() {
        return examStatusRepository.findFirstByNameIgnoreCase(DEFAULT_EXAM_STATUS_NAME)
                .orElseGet(() -> examStatusRepository.save(ExamStatus.builder().name(DEFAULT_EXAM_STATUS_NAME).build()));
    }
}
