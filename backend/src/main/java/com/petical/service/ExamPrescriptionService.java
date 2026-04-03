package com.petical.service;

import com.petical.dto.response.MedicineSearchItemResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ExamPrescriptionService {
    List<MedicineSearchItemResponse> searchMedicines(String keyword, Integer limit);
}
