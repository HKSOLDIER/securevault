package com.securevault.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.postgresql.util.PGobject;

@Converter
public class InetAddressConverter implements AttributeConverter<String, Object> {

    @Override
    public Object convertToDatabaseColumn(String ipAddress) {
        if (ipAddress == null) return null;
        try {
            PGobject pgo = new PGobject();
            pgo.setType("inet");
            pgo.setValue(ipAddress);
            return pgo;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid inet value: " + ipAddress, e);
        }
    }

    @Override
    public String convertToEntityAttribute(Object dbData) {
        if (dbData == null) return null;
        return dbData.toString();
    }
}