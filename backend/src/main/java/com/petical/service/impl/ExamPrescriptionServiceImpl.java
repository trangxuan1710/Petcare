package com.petical.service.impl;

import com.petical.dto.response.MedicineSearchItemResponse;
import com.petical.dto.response.PrescriptionAutofillResponse;
import com.petical.entity.MedicineSpecies;
import com.petical.entity.PetSpecies;
import com.petical.entity.PrescriptionRecommendation;
import com.petical.entity.ReceptionRecord;
import com.petical.enums.ErrorCode;
import com.petical.errors.AppException;
import com.petical.repository.MedicineRepository;
import com.petical.repository.PetSpeciesRepository;
import com.petical.repository.PrescriptionRecommendationRepository;
import com.petical.repository.ReceptionRecordRepository;
import com.petical.service.ExamPrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExamPrescriptionServiceImpl implements ExamPrescriptionService {
    private final MedicineRepository medicineRepository;
    private final ReceptionRecordRepository receptionRecordRepository;
    private final PetSpeciesRepository petSpeciesRepository;
    private final PrescriptionRecommendationRepository prescriptionRecommendationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MedicineSearchItemResponse> searchMedicines(String keyword, String type, String species, Integer limit) {
        int safeLimit = limit == null || limit <= 0 ? 20 : Math.min(limit, 100);
        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim();
        String normalizedType = normalizeType(type);
        String normalizedSpecies = normalizeSpeciesFilter(species);

        return medicineRepository.search(normalizedKeyword, normalizedType, normalizedSpecies)
                .stream()
                .limit(safeLimit)
                .map(medicine -> MedicineSearchItemResponse.builder()
                        .id(medicine.getId())
                        .name(medicine.getName())
                        .description(medicine.getDescription())
                        .unit(medicine.getUnit())
                        .price(resolveDisplayPrice(medicine))
                        .unitPrice(resolveUnitPrice(medicine))
                        .quantityPerBox(Math.max(1, medicine.getQuantityPerBox()))
                        .boxPrice(resolveBoxPrice(medicine))
                        .stockQuantity(medicine.getStockQuantity())
                        .type(medicine.getType())
                        .speciesCodes(resolveSpeciesCodes(medicine))
                        .speciesLabels(resolveSpeciesLabels(medicine))
                        .build())
                .toList();
    }

    private String normalizeType(String type) {
        if (type == null || type.isBlank()) {
            return null;
        }
        return type.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeSpeciesFilter(String species) {
        if (species == null || species.isBlank()) {
            return null;
        }
        String normalized = species.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "dog", "cho" -> "cho";
            case "cat", "meo" -> "meo";
            case "dog_and_cat", "dogandcat", "cho_va_meo", "chovameo", "both", "all" -> null;
            default -> normalized;
        };
    }

    private List<String> resolveSpeciesCodes(com.petical.entity.Medicine medicine) {
        if (medicine == null || medicine.getMedicineSpeciesLinks() == null) {
            return List.of();
        }
        return medicine.getMedicineSpeciesLinks().stream()
                .map(MedicineSpecies::getSpecies)
                .filter(java.util.Objects::nonNull)
                .sorted(Comparator.comparingInt(PetSpecies::getSortOrder).thenComparing(PetSpecies::getName))
                .map(PetSpecies::getCode)
                .toList();
    }

    private List<String> resolveSpeciesLabels(com.petical.entity.Medicine medicine) {
        if (medicine == null || medicine.getMedicineSpeciesLinks() == null) {
            return List.of();
        }
        return medicine.getMedicineSpeciesLinks().stream()
                .map(MedicineSpecies::getSpecies)
                .filter(java.util.Objects::nonNull)
                .sorted(Comparator.comparingInt(PetSpecies::getSortOrder).thenComparing(PetSpecies::getName))
                .map(PetSpecies::getName)
                .toList();
    }

    private java.math.BigDecimal resolveDisplayPrice(com.petical.entity.Medicine medicine) {
        return resolveBoxPrice(medicine);
    }

    private java.math.BigDecimal resolveUnitPrice(com.petical.entity.Medicine medicine) {
        if (medicine == null) {
            return java.math.BigDecimal.ZERO;
        }
        if (medicine.getUnitPrice() != null && medicine.getUnitPrice().signum() > 0) {
            return medicine.getUnitPrice();
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
        return java.math.BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionAutofillResponse getPrescriptionAutofill(long receptionRecordId) {
        ReceptionRecord currentReception = receptionRecordRepository.findById(receptionRecordId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String normalizedSpecies = resolveSpeciesKey(currentReception);
        BigDecimal currentWeight = normalizeWeight(currentReception.getWeight());
        String breed = resolveBreedKey(currentReception);

        return resolvePrescriptionAutofill(null, null, normalizedSpecies, currentWeight, breed);
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionAutofillResponse getPrescriptionAutofillByContext(Long medicineId, Long speciesId, String species, BigDecimal weight) {
        String normalizedSpecies = normalizeSpeciesText(species);
        BigDecimal currentWeight = normalizeWeight(weight);
        return resolvePrescriptionAutofill(medicineId, speciesId, normalizedSpecies, currentWeight, normalizedSpecies);
    }

    private PrescriptionAutofillResponse resolvePrescriptionAutofill(
            Long medicineId,
            Long speciesId,
            String normalizedSpecies,
            BigDecimal currentWeight,
            String breed
    ) {
        Long resolvedSpeciesId = speciesId;
        if (resolvedSpeciesId == null && normalizedSpecies != null) {
            resolvedSpeciesId = resolveSpeciesId(normalizedSpecies);
        }
        if (normalizedSpecies != null && resolvedSpeciesId == null) {
            return emptyAutofill(breed, currentWeight);
        }

        List<PrescriptionRecommendation> recommendationRows = prescriptionRecommendationRepository
                .findCandidates(medicineId, resolvedSpeciesId, currentWeight);

        if (recommendationRows.isEmpty()) {
            return emptyAutofill(breed, currentWeight);
        }

        List<PrescriptionRecommendation> selectedRows = selectBestRowPerMedicine(
                recommendationRows,
                currentWeight
        );
        if (selectedRows.isEmpty()) {
            return emptyAutofill(breed, currentWeight);
        }

        return buildAutofillFromRecommendations(breed, currentWeight, selectedRows);
    }

    private List<PrescriptionRecommendation> selectBestRowPerMedicine(
            List<PrescriptionRecommendation> candidates,
            BigDecimal currentWeight
    ) {
        Comparator<PrescriptionRecommendation> comparator = Comparator
                .comparing((PrescriptionRecommendation row) -> !isWeightBounded(row, currentWeight))
                .thenComparing(this::weightRangeWidth)
                .thenComparing(row -> nullSafe(row.getMinWeight()), Comparator.reverseOrder())
                .thenComparingLong(PrescriptionRecommendation::getId);

        Map<Long, PrescriptionRecommendation> bestByMedicine = new HashMap<>();
        for (PrescriptionRecommendation candidate : candidates) {
            if (candidate == null || candidate.getMedicine() == null || candidate.getMedicine().getId() <= 0) {
                continue;
            }
            long medicineId = candidate.getMedicine().getId();
            PrescriptionRecommendation currentBest = bestByMedicine.get(medicineId);
            if (currentBest == null || comparator.compare(candidate, currentBest) < 0) {
                bestByMedicine.put(medicineId, candidate);
            }
        }

        return bestByMedicine.values().stream()
                .sorted(Comparator
                        .comparing((PrescriptionRecommendation row) -> row.getMedicine().getName(), Comparator.nullsLast(String::compareToIgnoreCase))
                        .thenComparingLong(row -> row.getMedicine().getId()))
                .toList();
    }

    private boolean isWeightBounded(PrescriptionRecommendation row, BigDecimal currentWeight) {
        if (row == null || currentWeight == null || currentWeight.signum() <= 0) {
            return false;
        }
        return row.getMinWeight() != null || row.getMaxWeight() != null;
    }

    private BigDecimal weightRangeWidth(PrescriptionRecommendation row) {
        if (row == null || row.getMinWeight() == null || row.getMaxWeight() == null) {
            return BigDecimal.valueOf(Double.MAX_VALUE);
        }
        return row.getMaxWeight().subtract(row.getMinWeight()).abs();
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Long resolveSpeciesId(String normalizedSpecies) {
        if (normalizedSpecies == null || normalizedSpecies.isBlank()) {
            return null;
        }
        return petSpeciesRepository.findByCodeIgnoreCase(normalizedSpecies)
                .map(PetSpecies::getId)
                .orElse(null);
    }

    private PrescriptionAutofillResponse buildAutofillFromRecommendations(
            String breed,
            BigDecimal currentWeight,
            List<PrescriptionRecommendation> recommendations
    ) {
        if (recommendations == null || recommendations.isEmpty()) {
            return emptyAutofill(breed, currentWeight);
        }

        List<PrescriptionAutofillResponse.MedicineItem> medicines = recommendations.stream()
                .map(this::toAutofillMedicine)
                .filter(item -> item.getId() != null && item.getId() > 0)
                .toList();

        if (medicines.isEmpty()) {
            return emptyAutofill(breed, currentWeight);
        }

        return PrescriptionAutofillResponse.builder()
                .firstVisit(false)
                .hasRecommendation(true)
                .breed(breed)
                .currentWeight(currentWeight)
                .sourceReceptionId(null)
                .sourceWeight(null)
                .medicines(medicines)
                .build();
    }

    private BigDecimal normalizeWeight(BigDecimal weight) {
        if (weight == null || weight.signum() <= 0) {
            return null;
        }
        return weight;
    }

    private PrescriptionAutofillResponse emptyAutofill(String breed, BigDecimal currentWeight) {
        return PrescriptionAutofillResponse.builder()
                .firstVisit(false)
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

        return resolveSpeciesKey(receptionRecord);
    }

    private String resolveSpeciesKey(ReceptionRecord receptionRecord) {
        if (receptionRecord == null || receptionRecord.getPet() == null) {
            return null;
        }

        return normalizeSpeciesText(receptionRecord.getPet().getSpecies());
    }

    private String normalizeSpeciesText(String rawSpecies) {
        if (rawSpecies == null || rawSpecies.isBlank()) {
            return null;
        }
        String normalized = rawSpecies.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "dog", "cho", "chó" -> "cho";
            case "cat", "meo", "mèo" -> "meo";
            default -> normalized;
        };
    }

    private PrescriptionAutofillResponse.MedicineItem toAutofillMedicine(PrescriptionRecommendation recommendation) {
        var medicine = recommendation.getMedicine();
        if (medicine == null) {
            return PrescriptionAutofillResponse.MedicineItem.builder().build();
        }

        ParsedDosage parsedDosage = ParsedDosage.fromRecommendation(recommendation);
        String dosageUnit = firstNonBlank(
                recommendation.getDosageUnit(),
                medicine.getUnit()
        );
        BigDecimal medicinePrice = resolvePriceByUnit(medicine, dosageUnit);

        return PrescriptionAutofillResponse.MedicineItem.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .description(medicine.getDescription())
                .type(medicine.getType())
                .unit((dosageUnit == null || dosageUnit.isBlank()) ? medicine.getUnit() : dosageUnit.trim())
                .price(medicinePrice)
                .stockQuantity(medicine.getStockQuantity())
                .quantity(resolveRecommendedQuantity(recommendation.getQuantity()))
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

        // Rule: Medicines are always sold by box.
        // We prioritize the box price for all clinical records.
        if (medicine.getQuantityPerBox() > 0) {
            return resolveBoxPrice(medicine);
        }

        return resolveUnitPrice(medicine);
    }

    private Integer resolveRecommendedQuantity(BigDecimal rawQuantity) {
        if (rawQuantity == null || rawQuantity.signum() <= 0) {
            return 1;
        }
        return Math.max(1, rawQuantity.setScale(0, RoundingMode.CEILING).intValue());
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private record ParsedDosage(
            BigDecimal morning,
            BigDecimal noon,
            BigDecimal afternoon,
            BigDecimal evening,
            String note
    ) {
        private static ParsedDosage fromRecommendation(PrescriptionRecommendation recommendation) {
            if (recommendation == null) {
                return new ParsedDosage(BigDecimal.ONE, BigDecimal.ONE, BigDecimal.ONE, BigDecimal.ONE, "");
            }
            return new ParsedDosage(
                    nonNegative(recommendation.getDoseMorning()),
                    nonNegative(recommendation.getDoseNoon()),
                    nonNegative(recommendation.getDoseAfternoon()),
                    nonNegative(recommendation.getDoseEvening()),
                    recommendation.getInstruction() == null ? "" : recommendation.getInstruction().trim()
            );
        }

        private static BigDecimal nonNegative(BigDecimal value) {
            if (value == null) {
                return BigDecimal.ZERO;
            }
            return value.max(BigDecimal.ZERO);
        }
    }
}
