package com.petical.service.impl;

import com.petical.entity.Doctor;
import com.petical.entity.MedicalRecord;
import com.petical.entity.TreatmentSlip;
import com.petical.enums.ErrorCode;
import com.petical.errors.AppException;
import com.petical.repository.DoctorRepository;
import com.petical.repository.MedicalRecordRepository;
import com.petical.repository.TreatmentSlipRepository;
import com.petical.service.TreatmentSlipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TreatmentSlipServiceImpl implements TreatmentSlipService {
    private final TreatmentSlipRepository treatmentSlipRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final DoctorRepository doctorRepository;

    @Override
    @Transactional
    public TreatmentSlip createTreatmentSlip(TreatmentSlip request) {
        if (request == null || request.getMedicalRecord() == null || request.getMedicalRecord().getId() <= 0) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }
        if (request.getType() == null || request.getType().isBlank()) {
            throw new AppException(ErrorCode.ERROR_INPUT);
        }

        MedicalRecord medicalRecord = medicalRecordRepository.findById(request.getMedicalRecord().getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Doctor createdBy = null;
        if (request.getCreatedBy() != null && request.getCreatedBy().getId() > 0) {
            createdBy = doctorRepository.findById(request.getCreatedBy().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        }

        LocalDateTime now = LocalDateTime.now();
        TreatmentSlip toSave = TreatmentSlip.builder()
                .medicalRecord(medicalRecord)
                .type(request.getType())
                .plan(request.getPlan())
                .createdBy(createdBy)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return treatmentSlipRepository.save(toSave);
    }

    @Override
    @Transactional(readOnly = true)
    public TreatmentSlip getTreatmentSlip(long id) {
        return treatmentSlipRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    @Override
    @Transactional
    public TreatmentSlip updateTreatmentSlip(long id, TreatmentSlip request) {
        TreatmentSlip slip = treatmentSlipRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (request.getType() != null && !request.getType().isBlank()) {
            slip.setType(request.getType());
        }
        if (request.getPlan() != null) {
            slip.setPlan(request.getPlan());
        }
        slip.setUpdatedAt(LocalDateTime.now());

        return treatmentSlipRepository.save(slip);
    }
}
