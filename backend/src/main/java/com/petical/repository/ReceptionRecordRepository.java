package com.petical.repository;

import com.petical.entity.ReceptionRecord;
import com.petical.enums.ReceptionStatus;
import com.petical.repository.projection.ClientVisitCountProjection;
import com.petical.repository.projection.DoctorWaitingCaseCountProjection;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface ReceptionRecordRepository extends JpaRepository<ReceptionRecord, Long> {
	@Override
	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findAll();

	@Override
	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	java.util.Optional<ReceptionRecord> findById(Long id);

	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findByStatus(ReceptionStatus status);

	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findByStatusIn(Collection<ReceptionStatus> statuses);

	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findByReceptionTimeBetween(LocalDateTime start, LocalDateTime end);

	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findByDoctorIdIn(Collection<Long> doctorIds);

	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findByDoctorIdAndReceptionTimeBetween(Long doctorId, LocalDateTime start, LocalDateTime end);

	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findByDoctorId(Long doctorId);

	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findByDoctorIdAndStatusIn(Long doctorId, Collection<ReceptionStatus> statuses);

	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findByDoctorIdAndStatusInAndReceptionTimeBetween(Long doctorId, Collection<ReceptionStatus> statuses, LocalDateTime start, LocalDateTime end);

	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findByStatusAndReceptionTimeBetween(ReceptionStatus status, LocalDateTime start, LocalDateTime end);

	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findByStatusInAndReceptionTimeBetween(Collection<ReceptionStatus> statuses, LocalDateTime start, LocalDateTime end);

	@EntityGraph(attributePaths = {"client", "pet", "receptionist", "doctor", "examForm"})
	List<ReceptionRecord> findByPetIdOrderByReceptionTimeDesc(Long petId);

	long countByExamFormIsEmergencyTrueAndReceptionTimeBetween(LocalDateTime start, LocalDateTime end);

	long countByStatusInAndReceptionTimeBetween(Collection<ReceptionStatus> statuses, LocalDateTime start, LocalDateTime end);

	long countByStatusAndReceptionTimeBetween(ReceptionStatus status, LocalDateTime start, LocalDateTime end);

	long countByDoctorIdAndExamFormIsEmergencyTrueAndReceptionTimeBetween(Long doctorId, LocalDateTime start, LocalDateTime end);

	long countByDoctorIdAndStatusInAndReceptionTimeBetween(Long doctorId, Collection<ReceptionStatus> statuses, LocalDateTime start, LocalDateTime end);

	@Query("""
			select r.doctor.id as doctorId, count(r.id) as waitingCaseCount
			from ReceptionRecord r
			where r.doctor.id in :doctorIds
			  and r.status in :statuses
			  and r.receptionTime >= :start
			  and r.receptionTime < :end
			group by r.doctor.id
			""")
	List<DoctorWaitingCaseCountProjection> countWaitingCasesByDoctorIds(
			@Param("doctorIds") Collection<Long> doctorIds,
			@Param("statuses") Collection<ReceptionStatus> statuses,
			@Param("start") LocalDateTime start,
			@Param("end") LocalDateTime end
	);

	@Query("""
			select r.client.id as clientId, count(r.id) as visitCount
			from ReceptionRecord r
			where r.client.id in :clientIds
			group by r.client.id
			""")
	List<ClientVisitCountProjection> countVisitsByClientIds(@Param("clientIds") Collection<Long> clientIds);
}
