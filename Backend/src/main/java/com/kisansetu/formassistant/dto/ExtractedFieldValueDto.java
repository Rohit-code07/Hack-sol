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
public class ExtractedFieldValueDto {
    private String fieldName;
    private Object value;
    private String displayValue;
    private Double confidence;
    private String confidenceLevel;
    private String source;
    private String sourceSnippet;
    private Boolean requiresConfirmation;
}
