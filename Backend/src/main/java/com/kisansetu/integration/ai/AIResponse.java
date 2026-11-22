package com.kisansetu.integration.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIResponse {
    private boolean success;
    private String responseText;
    private String language;
    private Map<String, Object> metadata;
}
