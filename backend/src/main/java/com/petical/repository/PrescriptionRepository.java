package com.petical.repository;

import com.petical.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Optional<Prescription> findByExamResultId(long examResultId);

    List<Prescription> findByExamResultIdIn(Collection<Long> examResultIds);

    Optional<Prescription> findByMedicalRecordId(long medicalRecordId);

    List<Prescription> findByMedicalRecordIdIn(Collection<Long> medicalRecordIds);

    Optional<Prescription> findByReceptionServiceId(long receptionServiceId);

    List<Prescription> findByReceptionServiceIdIn(Collection<Long> receptionServiceIds);
}
