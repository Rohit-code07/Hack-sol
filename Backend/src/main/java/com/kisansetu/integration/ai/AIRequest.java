package com.kisansetu.integration.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AIRequest {
    private String query;
    private String question;
    private String language;
    private String scheme;
    private String documentId;
    private String conversationId;
    private Map<String, Object> context;

    public String getEffectiveQuestion() {
        if (question != null && !question.isBlank()) {
            return question;
        }
        return query != null ? query : "";
    }
}

