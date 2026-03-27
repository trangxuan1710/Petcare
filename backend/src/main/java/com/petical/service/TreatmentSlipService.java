package com.petical.service;

import com.petical.entity.TreatmentSlip;
import org.springframework.stereotype.Service;

@Service
public interface TreatmentSlipService {
    TreatmentSlip createTreatmentSlip(TreatmentSlip request);

    TreatmentSlip getTreatmentSlip(long id);

    TreatmentSlip updateTreatmentSlip(long id, TreatmentSlip request);
}
