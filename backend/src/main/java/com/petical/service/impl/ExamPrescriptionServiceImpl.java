package com.petical.service.impl;

import com.petical.dto.response.MedicineSearchItemResponse;
import com.petical.dto.response.PrescriptionAutofillResponse;
import com.petical.entity.PrescriptionDetail;
import com.petical.entity.ReceptionRecord;
import com.petical.enums.ErrorCode;
import com.petical.errors.AppException;
import com.petical.repository.MedicineRepository;
import com.petical.repository.PrescriptionDetailRepository;
import com.petical.repository.ReceptionRecordRepository;
import com.petical.service.ExamPrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExamPrescriptionServiceImpl implements ExamPrescriptionService {
    private final MedicineRepository medicineRepository;
    private final ReceptionRecordRepository receptionRecordRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;

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
                        .price(resolveDisplayPrice(medicine))
                        .unitPrice(resolveUnitPrice(medicine))
                        .boxPrice(resolveBoxPrice(medicine))
                        .stockQuantity(medicine.getStockQuantity())
                        .type(medicine.getType())
                        .build())
                .toList();
    }

    private java.math.BigDecimal resolveDisplayPrice(com.petical.entity.Medicine medicine) {
        java.math.BigDecimal boxPrice = resolveBoxPrice(medicine);
        if (boxPrice != null && boxPrice.signum() > 0) {
            return boxPrice;
        }
        return resolveUnitPrice(medicine);
    }

    private java.math.BigDecimal resolveUnitPrice(com.petical.entity.Medicine medicine) {
        if (medicine == null) {
            return java.math.BigDecimal.ZERO;
        }
        if (medicine.getUnitPrice() != null && medicine.getUnitPrice().signum() > 0) {
            return medicine.getUnitPrice();
        }
        if (medicine.getPrice() != null && medicine.getPrice().signum() > 0) {
            return medicine.getPrice();
        }
        return java.math.BigDecimal.ZERO;
    }

    private java.math.BigDecimal resolveBoxPrice(com.petical.entity.Medicine medicine) {
        if (medicine == null) {
            return java.math.BigDecimal.ZERO;
        }
        if (medicine.getBoxPrice() != null && medicine.getBoxPrice().signum() > 0) {
            return medicine.getBoxPrice();
        }
        if (medicine.getPrice() != null && medicine.getPrice().signum() > 0) {
            return medicine.getPrice();
        }
        return java.math.BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionAutofillResponse getPrescriptionAutofill(long receptionRecordId) {
        ReceptionRecord currentReception = receptionRecordRepository.findById(receptionRecordId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Long petId = currentReception.getPet() == null ? null : currentReception.getPet().getId();
        if (petId == null || petId <= 0) {
            return emptyAutofill(false, null, currentReception.getWeight());
        }

        boolean firstVisit = !prescriptionDetailRepository.existsByPetIdExcludingReception(petId, receptionRecordId);
        List<PrescriptionDetail> latestSamePetDetails = prescriptionDetailRepository
                .findLatestHistoricalByPetExcludingReception(petId, receptionRecordId);
        if (!latestSamePetDetails.isEmpty()) {
            return buildAutofillFromDetails(currentReception, firstVisit, latestSamePetDetails);
        }

        if (!firstVisit) {
            return emptyAutofill(false, resolveBreedKey(currentReception), currentReception.getWeight());
        }

        BigDecimal currentWeight = currentReception.getWeight();

        String normalizedBreed = resolveBreedKey(currentReception);
        if (normalizedBreed == null || normalizedBreed.isBlank()) {
            return emptyAutofill(true, normalizedBreed, currentWeight);
        }

        List<PrescriptionDetail> historicalDetails = prescriptionDetailRepository.findHistoricalByBreedExcludingPet(normalizedBreed, petId);
        if (historicalDetails.isEmpty()) {
            String normalizedSpecies = resolveSpeciesKey(currentReception);
            if (normalizedSpecies != null && !normalizedSpecies.isBlank()) {
                historicalDetails = prescriptionDetailRepository.findHistoricalBySpeciesExcludingPet(normalizedSpecies, petId);
            }
        }
        if (historicalDetails.isEmpty()) {
            return emptyAutofill(true, normalizedBreed, currentWeight);
        }

        Map<Long, CandidatePrescriptionCase> caseMap = new LinkedHashMap<>();
        for (PrescriptionDetail detail : historicalDetails) {
            ReceptionRecord sourceReception = extractSourceReception(detail);
            if (sourceReception == null) {
                continue;
            }

            caseMap.computeIfAbsent(sourceReception.getId(), ignored -> new CandidatePrescriptionCase(sourceReception))
                    .details
                    .add(detail);
        }

        if (caseMap.isEmpty()) {
            return emptyAutofill(true, normalizedBreed, currentWeight);
        }

        Optional<CandidatePrescriptionCase> nearestCase = Optional.empty();
        if (currentWeight != null && currentWeight.signum() > 0) {
            double targetWeight = currentWeight.doubleValue();
            nearestCase = caseMap.values()
                .stream()
                .filter(CandidatePrescriptionCase::hasWeight)
                .min(Comparator
                    .comparingDouble((CandidatePrescriptionCase candidate) -> candidate.weightDiff(targetWeight))
                    .thenComparing(candidate -> candidate.sourceReception.getReceptionTime(), Comparator.nullsLast(Comparator.reverseOrder()))
                );
        }

        if (nearestCase.isEmpty()) {
            nearestCase = caseMap.values()
                .stream()
                .max(Comparator.comparing(
                    candidate -> candidate.sourceReception.getReceptionTime(),
                    Comparator.nullsLast(Comparator.naturalOrder())
                ));
        }

        if (nearestCase.isEmpty()) {
            return emptyAutofill(true, normalizedBreed, currentWeight);
        }

        CandidatePrescriptionCase selectedCase = nearestCase.get();
        return buildAutofillFromDetails(currentReception, true, selectedCase.details);
    }

    private PrescriptionAutofillResponse buildAutofillFromDetails(
            ReceptionRecord currentReception,
            boolean firstVisit,
            List<PrescriptionDetail> details
    ) {
        if (details == null || details.isEmpty()) {
            return emptyAutofill(firstVisit, resolveBreedKey(currentReception), currentReception == null ? null : currentReception.getWeight());
        }

        List<PrescriptionAutofillResponse.MedicineItem> medicines = details.stream()
                .map(this::toAutofillMedicine)
                .filter(item -> item.getId() != null && item.getId() > 0)
                .toList();

        if (medicines.isEmpty()) {
            return emptyAutofill(firstVisit, resolveBreedKey(currentReception), currentReception == null ? null : currentReception.getWeight());
        }

        ReceptionRecord sourceReception = extractSourceReception(details.getFirst());

        return PrescriptionAutofillResponse.builder()
                .firstVisit(firstVisit)
                .hasRecommendation(true)
                .breed(resolveBreedKey(currentReception))
                .currentWeight(currentReception == null ? null : currentReception.getWeight())
                .sourceReceptionId(sourceReception == null ? null : sourceReception.getId())
                .sourceWeight(sourceReception == null ? null : sourceReception.getWeight())
                .medicines(medicines)
                .build();
    }

    private PrescriptionAutofillResponse emptyAutofill(boolean firstVisit, String breed, BigDecimal currentWeight) {
        return PrescriptionAutofillResponse.builder()
                .firstVisit(firstVisit)
                .hasRecommendation(false)
                .breed(breed)
                .currentWeight(currentWeight)
                .medicines(List.of())
                .build();
    }

    private String resolveBreedKey(ReceptionRecord receptionRecord) {
        if (receptionRecord == null || receptionRecord.getPet() == null) {
            return null;
        }

        String breed = receptionRecord.getPet().getBreed();
        if (breed != null && !breed.isBlank()) {
            return breed.trim().toLowerCase(Locale.ROOT);
        }

        String species = receptionRecord.getPet().getSpecies();
        return species == null || species.isBlank() ? null : species.trim().toLowerCase(Locale.ROOT);
    }

    private String resolveSpeciesKey(ReceptionRecord receptionRecord) {
        if (receptionRecord == null || receptionRecord.getPet() == null) {
            return null;
        }

        String species = receptionRecord.getPet().getSpecies();
        return species == null || species.isBlank() ? null : species.trim().toLowerCase(Locale.ROOT);
    }

    private ReceptionRecord extractSourceReception(PrescriptionDetail detail) {
        if (detail != null
                && detail.getPrescription() != null
                && detail.getPrescription().getReceptionService() != null
                && detail.getPrescription().getReceptionService().getReceptionRecord() != null) {
            return detail.getPrescription().getReceptionService().getReceptionRecord();
        }

        if (detail == null
                || detail.getPrescription() == null
                || detail.getPrescription().getExamResult() == null
                || detail.getPrescription().getExamResult().getMedicalRecord() == null) {
            return null;
        }

        return detail.getPrescription().getExamResult().getMedicalRecord().getReceptionRecord();
    }

    private PrescriptionAutofillResponse.MedicineItem toAutofillMedicine(PrescriptionDetail detail) {
        var medicine = detail.getMedicine();
        if (medicine == null) {
            return PrescriptionAutofillResponse.MedicineItem.builder().build();
        }

        ParsedDosage parsedDosage = readStructuredDosage(detail)
            .orElseGet(ParsedDosage::defaultValue);
        String dosageUnit = firstNonBlank(
            detail.getDosageUnit(),
            medicine.getUnit()
        );
        BigDecimal medicinePrice = resolvePriceByUnit(medicine, dosageUnit);

        return PrescriptionAutofillResponse.MedicineItem.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .type(medicine.getType())
                .unit((dosageUnit == null || dosageUnit.isBlank()) ? medicine.getUnit() : dosageUnit.trim())
                .price(medicinePrice)
                .stockQuantity(medicine.getStockQuantity())
                .quantity(Math.max(1, detail.getQuantity()))
                .dosage(PrescriptionAutofillResponse.Dosage.builder()
                        .morning(parsedDosage.morning)
                        .noon(parsedDosage.noon)
                        .afternoon(parsedDosage.afternoon)
                        .evening(parsedDosage.evening)
                        .note(parsedDosage.note)
                        .build())
                .build();
    }

    private BigDecimal resolvePriceByUnit(com.petical.entity.Medicine medicine, String dosageUnit) {
        if (medicine == null) {
            return BigDecimal.ZERO;
        }

        String normalizedUnit = dosageUnit == null ? "" : dosageUnit.trim().toLowerCase(Locale.ROOT);
        if ("hộp".equals(normalizedUnit) || "hop".equals(normalizedUnit) || "box".equals(normalizedUnit)) {
            BigDecimal boxPrice = resolveBoxPrice(medicine);
            if (boxPrice != null && boxPrice.signum() > 0) {
                return boxPrice;
            }
        }
        return resolveUnitPrice(medicine);
    }

    private Optional<ParsedDosage> readStructuredDosage(PrescriptionDetail detail) {
        if (detail == null) {
            return Optional.empty();
        }

        Integer morning = detail.getMorning();
        Integer noon = detail.getNoon();
        Integer afternoon = detail.getAfternoon();
        Integer evening = detail.getEvening();
        if (morning == null && noon == null && afternoon == null && evening == null) {
            return Optional.empty();
        }

        return Optional.of(new ParsedDosage(
            Math.max(0, morning == null ? 1 : morning),
            Math.max(0, noon == null ? 1 : noon),
            Math.max(0, afternoon == null ? 1 : afternoon),
            Math.max(0, evening == null ? 1 : evening),
                detail.getInstruction() == null ? "" : detail.getInstruction().trim()
        ));
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private static class CandidatePrescriptionCase {
        private final ReceptionRecord sourceReception;
        private final List<PrescriptionDetail> details = new ArrayList<>();

        private CandidatePrescriptionCase(ReceptionRecord sourceReception) {
            this.sourceReception = sourceReception;
        }

        private boolean hasWeight() {
            return sourceReception.getWeight() != null && sourceReception.getWeight().signum() > 0;
        }

        private double weightDiff(double targetWeight) {
            if (!hasWeight()) {
                return Double.MAX_VALUE;
            }
            return Math.abs(sourceReception.getWeight().doubleValue() - targetWeight);
        }
    }

    private record ParsedDosage(int morning, int noon, int afternoon, int evening, String note) {
        private static ParsedDosage defaultValue() {
            return new ParsedDosage(1, 1, 1, 1, "");
        }
    }
}
