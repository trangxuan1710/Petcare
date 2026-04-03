package com.petical.entity.converter;

import com.petical.enums.ExamType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ExamTypeConverter implements AttributeConverter<ExamType, String> {
    @Override
    public String convertToDatabaseColumn(ExamType attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public ExamType convertToEntityAttribute(String dbData) {
        return ExamType.fromValue(dbData);
    }
}