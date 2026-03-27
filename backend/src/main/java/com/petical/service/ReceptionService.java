package com.petical.service;

import com.petical.entity.ReceptionRecord;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public interface ReceptionService {
    ReceptionRecord createReceptionEntity(ReceptionRecord request);
    List<ReceptionRecord> listReceptionSlips(String status, LocalDate date, Long branchId);
    ReceptionRecord getReceptionSlip(long id);
    ReceptionRecord updateReceptionSlip(long id, ReceptionRecord request);
}
