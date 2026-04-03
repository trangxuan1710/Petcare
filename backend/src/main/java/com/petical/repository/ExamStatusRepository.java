package com.petical.repository;

import com.petical.entity.ExamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExamStatusRepository extends JpaRepository<ExamStatus, Long> {
    Optional<ExamStatus> findFirstByNameIgnoreCase(String name);
}