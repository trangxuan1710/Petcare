package com.petical.repository;

import com.petical.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    Optional<Technician> findFirstByOrderByIdAsc();

    @Query("""
            select t
            from Technician t
            where (:keyword is null
                or lower(t.fullName) like lower(concat('%', :keyword, '%')))
            order by t.fullName asc
            """)
    List<Technician> searchByName(@Param("keyword") String keyword);
}