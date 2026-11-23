package com.kisansetu.integration.ai;

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
public class AIResponse {
    private boolean success;
    private String responseText;
    private String answer;
    private String subject;
    private String body;
    private String explanation;
    private String recommendedAction;
    private List<String> documentsToVerify;
    private List<String> evidenceChecklist;
    private List<Map<String, Object>> sources;
    private String confidence;
    private String language;
    private String category;
    private String generatedBy;
    private Map<String, Object> metadata;

    public String getEffectiveAnswer() {
        if (answer != null && !answer.isBlank()) {
            return answer;
        }
        if (responseText != null && !responseText.isBlank()) {
            return responseText;
        }
        if (explanation != null && !explanation.isBlank()) {
            return explanation;
        }
        if (body != null && !body.isBlank()) {
            return body;
        }
        return "";
    }
}

