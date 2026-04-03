package com.petical.repository;

import com.petical.entity.ExamResult;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    Optional<ExamResult> findFirstByMedicalRecordId(long medicalRecordId);

    Optional<ExamResult> findFirstByMedicalRecordIdOrderByIdDesc(long medicalRecordId);

    @EntityGraph(attributePaths = {"treatmentDirection"})
    List<ExamResult> findByMedicalRecordIdIn(Collection<Long> medicalRecordIds);
}