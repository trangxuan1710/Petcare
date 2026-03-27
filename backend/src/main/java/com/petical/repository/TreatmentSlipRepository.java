package com.petical.repository;

import com.petical.entity.TreatmentSlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TreatmentSlipRepository extends JpaRepository<TreatmentSlip, Long> {
}
