package com.kisansetu.formassistant.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FormSchemaDto {
    private String formId;
    private String formTitle;
    private String formTitleHi;
    private String description;
    private List<FormFieldMetadataDto> fields;
}
