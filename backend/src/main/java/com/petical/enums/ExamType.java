package com.petical.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.Locale;

public enum ExamType {
    NEW_EXAM("khám mới"),
    RE_EXAM("tái khám");

    private final String value;

    ExamType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ExamType fromValue(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        String normalized = rawValue.trim();
        String normalizedKey = normalizeKey(rawValue);

        if (isAliasOfNewExam(normalizedKey)) {
            return NEW_EXAM;
        }
        if (isAliasOfReExam(normalizedKey)) {
            return RE_EXAM;
        }

        return Arrays.stream(values())
                .filter(type -> type.name().equalsIgnoreCase(normalized)
                        || type.value.equalsIgnoreCase(normalized)
                        || normalizeKey(type.value).equals(normalizedKey))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid exam type: " + rawValue));
    }

    private static boolean isAliasOfNewExam(String value) {
        return value.equals("general")
                || value.equals("newexam")
                || value.equals("new")
                || value.equals("khammoi")
                || value.equals("khamtaiphong")
                || value.equals("khamlamsang")
                || value.equals("lamsang");
    }

    private static boolean isAliasOfReExam(String value) {
        return value.equals("surgery")
                || value.equals("reexam")
                || value.equals("re")
                || value.equals("taikham")
                || value.equals("noitru")
                || value.equals("khamnoitru")
                || value.equals("dieutrinoitru")
                || value.equals("dermatology")
                || value.equals("dentistry")
                || value.equals("ngoaitru")
                || value.equals("khamngoaitru")
                || value.equals("dieutringoaitru")
                || value.equals("vaccine")
                || value.equals("canlamsang")
                || value.equals("khamcanlamsang")
                || value.equals("xetnghiem")
                || value.equals("chandoanhinhanh");
    }

    private static String normalizeKey(String input) {
        if (input == null) {
            return "";
        }

        String decomposed = Normalizer.normalize(input.trim(), Normalizer.Form.NFD);
        String withoutAccents = decomposed.replaceAll("\\p{M}+", "");
        return withoutAccents
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");
    }
}