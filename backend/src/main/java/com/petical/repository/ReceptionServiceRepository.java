package com.petical.repository;

import com.petical.entity.ReceptionService;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ReceptionServiceRepository extends JpaRepository<ReceptionService, Long> {
    boolean existsByReceptionRecordIdAndServiceId(long receptionRecordId, long serviceId);

    @EntityGraph(attributePaths = {"service"})
    List<ReceptionService> findByReceptionRecordId(long receptionRecordId);

    @EntityGraph(attributePaths = {"service"})
    List<ReceptionService> findByReceptionRecordIdIn(Collection<Long> receptionRecordIds);
}