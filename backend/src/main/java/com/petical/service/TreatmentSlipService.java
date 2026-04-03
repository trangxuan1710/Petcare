package com.petical.service;

import com.petical.entity.TreatmentSlip;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface TreatmentSlipService {
    TreatmentSlip createTreatmentSlip(TreatmentSlip request);

    TreatmentSlip getTreatmentSlip(long id);

    List<TreatmentSlip> getTreatmentSlipsByReceptionId(long receptionId);

    TreatmentSlip updateTreatmentSlip(long id, TreatmentSlip request);
}
