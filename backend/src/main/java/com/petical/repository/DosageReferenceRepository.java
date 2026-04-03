package com.petical.repository;

import com.petical.entity.DosageReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DosageReferenceRepository extends JpaRepository<DosageReference, Long> {
}
