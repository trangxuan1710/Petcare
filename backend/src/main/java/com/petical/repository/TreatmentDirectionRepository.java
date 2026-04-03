package com.petical.repository;

import com.petical.entity.TreatmentDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TreatmentDirectionRepository extends JpaRepository<TreatmentDirection, Long> {
    Optional<TreatmentDirection> findFirstByNameIgnoreCase(String name);
}
