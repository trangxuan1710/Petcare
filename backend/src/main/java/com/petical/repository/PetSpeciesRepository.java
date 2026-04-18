package com.petical.repository;

import com.petical.entity.PetSpecies;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetSpeciesRepository extends JpaRepository<PetSpecies, Long> {
    Optional<PetSpecies> findByCodeIgnoreCase(String code);

    List<PetSpecies> findByActiveTrueOrderBySortOrderAscNameAsc();
}
