package com.petical.repository;

import com.petical.entity.Prepayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrepaymentRepository extends JpaRepository<Prepayment, Long> {
    List<Prepayment> findByReceptionRecordId(long receptionRecordId);
}
