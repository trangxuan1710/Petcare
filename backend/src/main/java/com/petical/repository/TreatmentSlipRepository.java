package com.petical.repository;

import com.petical.entity.TreatmentSlip;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentSlipRepository extends JpaRepository<TreatmentSlip, Long> {
	@EntityGraph(attributePaths = {
			"medicalRecord",
			"medicalRecord.receptionRecord",
			"medicalRecord.doctor",
			"medicalRecord.status",
			"createdBy"
	})
	List<TreatmentSlip> findByMedicalRecordReceptionRecordIdOrderByCreatedAtDesc(Long receptionRecordId);
}
