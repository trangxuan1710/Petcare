package com.petical.service;

import com.petical.dto.response.MedicineSearchItemResponse;
import com.petical.dto.response.PrescriptionAutofillResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public interface ExamPrescriptionService {
    List<MedicineSearchItemResponse> searchMedicines(String keyword, String type, String species, Integer limit);

    PrescriptionAutofillResponse getPrescriptionAutofill(long receptionRecordId);

    PrescriptionAutofillResponse getPrescriptionAutofillByContext(Long medicineId, Long speciesId, String species, BigDecimal weight);
}
