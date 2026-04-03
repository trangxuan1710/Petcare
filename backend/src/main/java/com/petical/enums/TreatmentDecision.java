package com.petical.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum TreatmentDecision {
    DISCHARGE("cho về"),
    INPATIENT_TREATMENT("điều trị nội trú"),
    OUTPATIENT_TREATMENT("điều trị ngoại trú"),
    PARACLINICAL_EXAM("khám cận lâm sàng");

    private final String value;

    TreatmentDecision(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static TreatmentDecision fromValue(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        String normalized = rawValue.trim();
        return Arrays.stream(values())
                .filter(option -> option.name().equalsIgnoreCase(normalized)
                        || option.value.equalsIgnoreCase(normalized)
                        || (option == DISCHARGE && "cho_ve".equalsIgnoreCase(normalized))
                        || (option == INPATIENT_TREATMENT && "noi_tru".equalsIgnoreCase(normalized))
                        || (option == OUTPATIENT_TREATMENT && "ngoai_tru".equalsIgnoreCase(normalized))
                        || (option == PARACLINICAL_EXAM && "can_lam_sang".equalsIgnoreCase(normalized)))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid treatment decision: " + rawValue));
    }
}
