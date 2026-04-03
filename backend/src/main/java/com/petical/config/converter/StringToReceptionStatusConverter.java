package com.petical.config.converter;

import com.petical.enums.ReceptionStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToReceptionStatusConverter implements Converter<String, ReceptionStatus> {

    @Override
    public ReceptionStatus convert(String source) {
        return ReceptionStatus.fromValue(source);
    }
}
