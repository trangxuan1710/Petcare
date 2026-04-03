package com.petical.repository;

import com.petical.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    Optional<Service> findFirstByNameIgnoreCase(String name);

    @Query("""
            select s
            from Service s
            where (:keyword is null
                or lower(s.name) like lower(concat('%', :keyword, '%')))
            order by s.name asc
            """)
    List<Service> searchByName(@Param("keyword") String keyword);
}