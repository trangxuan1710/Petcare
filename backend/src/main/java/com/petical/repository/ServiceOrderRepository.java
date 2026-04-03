package com.petical.repository;

import com.petical.entity.ServiceOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, Long> {
    boolean existsByMedicalRecordIdAndServiceId(long medicalRecordId, long serviceId);

    boolean existsByMedicalRecordIdAndServiceIdAndTechnicianId(long medicalRecordId, long serviceId, long technicianId);

    @EntityGraph(attributePaths = {"service", "technician"})
    List<ServiceOrder> findByMedicalRecordId(long medicalRecordId);

    @EntityGraph(attributePaths = {"service", "medicalRecord.doctor", "medicalRecord.receptionRecord.pet"})
    List<ServiceOrder> findByTechnicianId(long technicianId);
}