package com.petical.repository;

import com.petical.entity.ReceptionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface ReceptionRecordRepository extends JpaRepository<ReceptionRecord, Long> {
	List<ReceptionRecord> findByStatusIgnoreCase(String status);

	List<ReceptionRecord> findByReceptionTimeBetween(LocalDateTime start, LocalDateTime end);

	List<ReceptionRecord> findByStatusIgnoreCaseAndReceptionTimeBetween(String status, LocalDateTime start, LocalDateTime end);

	long countByExamFormIsEmergencyTrueAndReceptionTimeBetween(LocalDateTime start, LocalDateTime end);

	long countByStatusIgnoreCaseInAndReceptionTimeBetween(Collection<String> statuses, LocalDateTime start, LocalDateTime end);

	long countByStatusIgnoreCaseAndReceptionTimeBetween(String status, LocalDateTime start, LocalDateTime end);
}
