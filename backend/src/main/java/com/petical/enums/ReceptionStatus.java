package com.petical.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum ReceptionStatus {
    WAITING_EXECUTION("chờ thực hiện"),
    WAITING_CONCLUSION("chờ kết luận"),
    IN_PROGRESS("đang thực hiện"),
    WAITING_PAYMENT("chờ thanh toán"),
    PAID("đã thanh toán");

    private final String value;

    ReceptionStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ReceptionStatus fromValue(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        String normalized = rawValue.trim();
        return Arrays.stream(values())
                .filter(status -> status.name().equalsIgnoreCase(normalized)
                        || status.value.equalsIgnoreCase(normalized)
                        || (status == WAITING_EXECUTION && "đã tiếp đón".equalsIgnoreCase(normalized))
                        || (status == WAITING_EXECUTION && "received".equalsIgnoreCase(normalized))
                        || (status == WAITING_CONCLUSION && "waiting_conclusion".equalsIgnoreCase(normalized))
                        || (status == IN_PROGRESS && "waiting_treatment".equalsIgnoreCase(normalized))
                        || (status == IN_PROGRESS && "đang chờ trị".equalsIgnoreCase(normalized))
                        || (status == WAITING_PAYMENT && "waiting_payment".equalsIgnoreCase(normalized))
                        || (status == PAID && "paid".equalsIgnoreCase(normalized))
                        || (status == PAID && "completed".equalsIgnoreCase(normalized))
                        || (status == PAID && "đã hoàn thành".equalsIgnoreCase(normalized)))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid reception status: " + rawValue));
    }
}