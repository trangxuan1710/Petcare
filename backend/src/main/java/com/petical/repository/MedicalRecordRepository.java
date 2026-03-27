package com.petical.repository;

import com.petical.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
	Optional<MedicalRecord> findByReceptionRecordId(long receptionRecordId);
}

