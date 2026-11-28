package com.kisansetu.formassistant.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FormExtractResponseDto {
    private String formId;
    private Boolean success;
    private Map<String, ExtractedFieldValueDto> extractedFields;
    private List<FieldConflictDto> conflicts;
    private String summary;
    private String unmatchedNotes;
    private String source;
    private String language;
}
