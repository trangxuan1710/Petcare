package com.petical.repository;

import com.petical.entity.ExamTypeOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamTypeOptionRepository extends JpaRepository<ExamTypeOption, Long> {
    Optional<ExamTypeOption> findByCodeIgnoreCase(String code);

    List<ExamTypeOption> findByActiveTrueOrderBySortOrderAscNameAsc();
}
