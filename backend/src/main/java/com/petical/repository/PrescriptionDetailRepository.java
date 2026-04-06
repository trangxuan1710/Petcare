package com.petical.repository;

import com.petical.entity.PrescriptionDetail;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface PrescriptionDetailRepository extends JpaRepository<PrescriptionDetail, Long> {
    void deleteByPrescriptionId(long prescriptionId);

    @EntityGraph(attributePaths = {"medicine"})
    List<PrescriptionDetail> findByPrescriptionIdIn(Collection<Long> prescriptionIds);

    @EntityGraph(attributePaths = {
        "medicine",
        "prescription.receptionService.receptionRecord",
        "prescription.receptionService.receptionRecord.pet"
    })
    @Query("""
        select pd
        from PrescriptionDetail pd
        join pd.prescription p
        join p.receptionService rs
        join rs.receptionRecord rr
        where rr.pet.id = :petId
          and rr.id <> :currentReceptionId
          and coalesce(rs.createdAt, rr.receptionTime) = (
                select max(coalesce(rs2.createdAt, rr2.receptionTime))
                from Prescription p2
                join p2.receptionService rs2
                join rs2.receptionRecord rr2
                where rr2.pet.id = :petId
                  and rr2.id <> :currentReceptionId
          )
        order by pd.medicine.id asc, pd.id asc
        """)
    List<PrescriptionDetail> findLatestHistoricalByPetExcludingReception(
        @Param("petId") Long petId,
        @Param("currentReceptionId") Long currentReceptionId
    );

    @EntityGraph(attributePaths = {
        "medicine",
        "prescription.receptionService.receptionRecord",
        "prescription.receptionService.receptionRecord.pet"
    })
    @Query("""
        select pd
        from PrescriptionDetail pd
        join pd.prescription p
        join p.receptionService rs
        join rs.receptionRecord rr
        join rr.pet pet
        where lower(trim(coalesce(pet.breed, pet.species, ''))) = :normalizedBreed
          and rr.pet.id <> :excludedPetId
          and p.receptionService is not null
        order by coalesce(rs.createdAt, rr.receptionTime) desc, pd.medicine.id asc, pd.id asc
        """)
    List<PrescriptionDetail> findHistoricalByBreedExcludingPet(
        @Param("normalizedBreed") String normalizedBreed,
        @Param("excludedPetId") Long excludedPetId
    );

    @EntityGraph(attributePaths = {
        "medicine",
        "prescription.receptionService.receptionRecord",
        "prescription.receptionService.receptionRecord.pet"
    })
    @Query("""
        select pd
        from PrescriptionDetail pd
        join pd.prescription p
        join p.receptionService rs
        join rs.receptionRecord rr
        join rr.pet pet
        where lower(trim(coalesce(pet.species, ''))) = :normalizedSpecies
          and rr.pet.id <> :excludedPetId
          and p.receptionService is not null
        order by coalesce(rs.createdAt, rr.receptionTime) desc, pd.medicine.id asc, pd.id asc
        """)
    List<PrescriptionDetail> findHistoricalBySpeciesExcludingPet(
        @Param("normalizedSpecies") String normalizedSpecies,
        @Param("excludedPetId") Long excludedPetId
    );

    @Query("""
        select count(pd.id) > 0
        from PrescriptionDetail pd
        join pd.prescription p
        join p.receptionService rs
        join rs.receptionRecord rr
        where rr.pet.id = :petId
          and rr.id <> :currentReceptionId
        """)
    boolean existsByPetIdExcludingReception(
        @Param("petId") Long petId,
        @Param("currentReceptionId") Long currentReceptionId
    );
}