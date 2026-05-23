package com.securevault.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.postgresql.util.PGobject;

@Converter
public class JsonbConverter implements AttributeConverter<String, Object> {

    @Override
    public Object convertToDatabaseColumn(String json) {
        if (json == null) return null;
        try {
            PGobject pgo = new PGobject();
            pgo.setType("jsonb");
            pgo.setValue(json);
            return pgo;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid jsonb value: " + json, e);
        }
    }

    @Override
    public String convertToEntityAttribute(Object dbData) {
        if (dbData == null) return null;
        return dbData.toString();
    }
}