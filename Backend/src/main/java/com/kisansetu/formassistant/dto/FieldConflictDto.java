package com.kisansetu.formassistant.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FieldConflictDto {
    private String fieldName;
    private String fieldLabel;
    private Object existingValue;
    private Object extractedValue;
    private String source;
    private String reason;
}
