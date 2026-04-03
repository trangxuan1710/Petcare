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
            select m
            from Medicine m
            where (:keyword is null
                or lower(m.name) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(m.type, '')) like lower(concat('%', :keyword, '%')))
            order by m.name asc
            """)
    List<Medicine> search(@Param("keyword") String keyword);
}
