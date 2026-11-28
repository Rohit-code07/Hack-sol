package com.kisansetu.document.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentAskResponseDto {
    private String answer;
    private String language;
    private String confidence;
    private List<Map<String, Object>> sources;
    private Boolean success;
}
