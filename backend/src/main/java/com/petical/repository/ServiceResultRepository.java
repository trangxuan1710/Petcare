package com.petical.repository;

import com.petical.entity.ServiceResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceResultRepository extends JpaRepository<ServiceResult, Long> {
    List<ServiceResult> findByServiceOrderIdIn(List<Long> serviceOrderIds);
}
