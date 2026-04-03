package com.petical.entity.converter;

import com.petical.enums.ReceptionStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ReceptionStatusConverter implements AttributeConverter<ReceptionStatus, String> {

    @Override
    public String convertToDatabaseColumn(ReceptionStatus attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public ReceptionStatus convertToEntityAttribute(String dbData) {
        return ReceptionStatus.fromValue(dbData);
    }
}