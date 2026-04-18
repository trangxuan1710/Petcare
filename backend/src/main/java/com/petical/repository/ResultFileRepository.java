package com.petical.repository;

import com.petical.entity.ResultFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ResultFileRepository extends JpaRepository<ResultFile, Long> {
    List<ResultFile> findByExamResultIdOrderByIdAsc(long examResultId);

    List<ResultFile> findByExamResultIdInOrderByIdAsc(Collection<Long> examResultIds);

    List<ResultFile> findByServiceResultIdOrderByIdAsc(long serviceResultId);

    List<ResultFile> findByServiceResultIdInOrderByIdAsc(Collection<Long> serviceResultIds);
}
