package com.petical.repository;

import com.petical.entity.PetBreed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PetBreedRepository extends JpaRepository<PetBreed, Long> {
    Optional<PetBreed> findBySpeciesCodeIgnoreCaseAndNameIgnoreCase(String speciesCode, String name);

    List<PetBreed> findByActiveTrueOrderBySpeciesSortOrderAscSortOrderAscNameAsc();

    List<PetBreed> findBySpeciesCodeIgnoreCaseAndActiveTrueOrderBySortOrderAscNameAsc(String speciesCode);
}
