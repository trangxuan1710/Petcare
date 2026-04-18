package com.petical.repository;

import com.petical.entity.PrescriptionRecommendation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PrescriptionRecommendationRepository extends JpaRepository<PrescriptionRecommendation, Long> {
    @EntityGraph(attributePaths = {"medicine", "species"})
    @Query("""
        select pr
        from PrescriptionRecommendation pr
        where (:medicineId is null or pr.medicine.id = :medicineId)
          and (:speciesId is null or pr.species.id = :speciesId)
          and (
              :weight is null
              or (
                  (pr.minWeight is null or pr.minWeight <= :weight)
                  and (pr.maxWeight is null or pr.maxWeight >= :weight)
              )
          )
        order by pr.id asc
        """)
    List<PrescriptionRecommendation> findCandidates(
        @Param("medicineId") Long medicineId,
        @Param("speciesId") Long speciesId,
        @Param("weight") BigDecimal weight
    );
}
