package com.petical.util;

import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;

public final class TextFormatUtils {
    private static final Locale VI_LOCALE = Locale.forLanguageTag("vi-VN");

    private TextFormatUtils() {
    }

    public static String toTitleCase(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim().replaceAll("\\s+", " ");
        if (normalized.isBlank()) {
            return "";
        }

        return Arrays.stream(normalized.toLowerCase(VI_LOCALE).split(" "))
                .map(TextFormatUtils::capitalizeWord)
                .collect(Collectors.joining(" "));
    }

    private static String capitalizeWord(String word) {
        if (word == null || word.isBlank()) {
            return "";
        }
        int firstCodePoint = word.codePointAt(0);
        int firstLength = Character.charCount(firstCodePoint);
        String first = new String(Character.toChars(firstCodePoint)).toUpperCase(VI_LOCALE);
        return first + word.substring(firstLength);
    }
}
