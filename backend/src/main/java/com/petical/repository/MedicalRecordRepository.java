package com.petical.repository;

import com.petical.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Collection;
import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
	Optional<MedicalRecord> findByReceptionRecordId(long receptionRecordId);

	List<MedicalRecord> findByReceptionRecordIdIn(Collection<Long> receptionRecordIds);
}

