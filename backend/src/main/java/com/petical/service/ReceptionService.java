package com.petical.service;

import com.petical.dto.request.CreateReceptionSlipRequest;
import com.petical.dto.request.UpdateReceptionSlipRequest;
import com.petical.dto.response.ExamAggregateResponse;
import com.petical.dto.response.ReceptionAssignedServiceResponse;
import com.petical.entity.ReceptionRecord;
import com.petical.enums.ReceptionStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public interface ReceptionService {
    ReceptionRecord createReceptionSlip(CreateReceptionSlipRequest request);
    List<ReceptionRecord> listReceptionSlips(ReceptionStatus status, LocalDate date, LocalDate fromDate, LocalDate toDate, Long branchId);
    List<ReceptionRecord> listReceptionSlipsByStates(List<ReceptionStatus> states, LocalDate date, LocalDate fromDate, LocalDate toDate);
    ReceptionRecord getReceptionSlip(long id);
    ExamAggregateResponse getExamAggregate(long receptionId);
    List<ReceptionAssignedServiceResponse> getAssignedServices(long receptionId);
    void ensureDefaultClinicalServicePending(long receptionId);
    ReceptionRecord updateReceptionSlip(long id, UpdateReceptionSlipRequest request);
}
