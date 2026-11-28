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
public class FormFieldMetadataDto {
    private String name;
    private String label;
    private String labelHi;
    private String type;
    private Boolean required;
    private String placeholder;
    private List<FormFieldOptionDto> options;
    private List<String> aliases;
    private Boolean sensitive;
}
