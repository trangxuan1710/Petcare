package com.petical.service.impl;

import com.petical.dto.response.MedicineSearchItemResponse;
import com.petical.repository.MedicineRepository;
import com.petical.service.ExamPrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamPrescriptionServiceImpl implements ExamPrescriptionService {
    private final MedicineRepository medicineRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MedicineSearchItemResponse> searchMedicines(String keyword, Integer limit) {
        int safeLimit = limit == null || limit <= 0 ? 20 : Math.min(limit, 100);
        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim();

        return medicineRepository.search(normalizedKeyword)
                .stream()
                .limit(safeLimit)
                .map(medicine -> MedicineSearchItemResponse.builder()
                        .id(medicine.getId())
                        .name(medicine.getName())
                        .unit(medicine.getUnit())
                        .price(medicine.getPrice())
                        .stockQuantity(medicine.getStockQuantity())
                        .type(medicine.getType())
                        .build())
                .toList();
    }
}
