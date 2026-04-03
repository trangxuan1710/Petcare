package com.petical.repository;

import com.petical.entity.PrescriptionDetail;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface PrescriptionDetailRepository extends JpaRepository<PrescriptionDetail, Long> {
    void deleteByPrescriptionId(long prescriptionId);

    @EntityGraph(attributePaths = {"medicine", "dosageReference"})
    List<PrescriptionDetail> findByPrescriptionIdIn(Collection<Long> prescriptionIds);
}