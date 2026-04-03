package com.petical.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum ReceptionServiceStatus {
    PENDING("pending"),
    IN_PROGRESS("in_progress"),
    COMPLETED("completed");

    private final String value;

    ReceptionServiceStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ReceptionServiceStatus fromValue(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        String normalized = rawValue.trim();
        return Arrays.stream(values())
                .filter(status -> status.name().equalsIgnoreCase(normalized)
                        || status.value.equalsIgnoreCase(normalized)
                        || (status == PENDING && "waiting_execution".equalsIgnoreCase(normalized))
                        || (status == PENDING && "chờ thực hiện".equalsIgnoreCase(normalized))
                        || (status == IN_PROGRESS && "waiting_conclusion".equalsIgnoreCase(normalized))
                        || (status == IN_PROGRESS && "waiting_payment".equalsIgnoreCase(normalized))
                        || (status == IN_PROGRESS && "đang thực hiện".equalsIgnoreCase(normalized))
                        || (status == COMPLETED && "paid".equalsIgnoreCase(normalized))
                        || (status == COMPLETED && "đã thanh toán".equalsIgnoreCase(normalized))
                        || (status == COMPLETED && "đã hoàn thành".equalsIgnoreCase(normalized)))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid reception service status: " + rawValue));
    }
}