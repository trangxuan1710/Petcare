package com.petical.service.impl;

import com.petical.dto.response.TechnicianAssignedServiceItemResponse;
import com.petical.dto.response.TechnicianAssignedServiceListResponse;
import com.petical.entity.Doctor;
import com.petical.entity.Pet;
import com.petical.entity.ReceptionRecord;
import com.petical.entity.ServiceOrder;
import com.petical.entity.ServiceResult;
import com.petical.entity.Technician;
import com.petical.entity.User;
import com.petical.enums.ErrorCode;
import com.petical.enums.TechnicianServiceTaskStatus;
import com.petical.errors.AppException;
import com.petical.repository.ServiceOrderRepository;
import com.petical.repository.ServiceResultRepository;
import com.petical.repository.TechnicianRepository;
import com.petical.service.TechnicianWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechnicianWorkServiceImpl implements TechnicianWorkService {

    private final ServiceOrderRepository serviceOrderRepository;
    private final ServiceResultRepository serviceResultRepository;
    private final TechnicianRepository technicianRepository;

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
        User principal = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof Technician technician)) {
            throw new AppException(ErrorCode.NO_PERMISSION);
        }
        return getAssignedServices(technician.getId(), status, keyword);
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
}
