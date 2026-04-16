package com.petical.service;

import com.petical.dto.response.MedicineSearchItemResponse;
import com.petical.dto.response.PrescriptionAutofillResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ExamPrescriptionService {
    List<MedicineSearchItemResponse> searchMedicines(String keyword, String type, Integer limit);

    PrescriptionAutofillResponse getPrescriptionAutofill(long receptionRecordId);
}
