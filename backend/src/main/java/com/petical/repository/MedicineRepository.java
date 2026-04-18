package com.petical.repository;

import com.petical.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    @Query("""
            select distinct m
            from Medicine m
            left join m.medicineSpeciesLinks medicineSpecies
            left join medicineSpecies.species species
            where (:keyword is null
                or lower(m.name) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(m.description, '')) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(m.type, '')) like lower(concat('%', :keyword, '%')))
              and (:type is null or upper(coalesce(m.type, '')) = upper(:type))
              and (
                  :speciesCode is null
                  or upper(coalesce(m.type, '')) <> 'MEDICINE'
                  or lower(species.code) = lower(:speciesCode)
              )
            order by m.name asc
            """)
    List<Medicine> search(
            @Param("keyword") String keyword,
            @Param("type") String type,
            @Param("speciesCode") String speciesCode
    );
}
