package com.petical.repository;

import com.petical.entity.ExamForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamFormRepository extends JpaRepository<ExamForm, Long> {
}
