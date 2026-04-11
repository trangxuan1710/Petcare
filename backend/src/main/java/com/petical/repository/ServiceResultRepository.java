package com.petical.repository;

import com.petical.entity.ServiceResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceResultRepository extends JpaRepository<ServiceResult, Long> {
    List<ServiceResult> findByServiceOrderIdIn(List<Long> serviceOrderIds);

    Optional<ServiceResult> findByServiceOrderId(long serviceOrderId);
}
