package com.kisansetu.document.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoiceTranscribeResponseDto {
    private String transcription;
    private String detectedLanguage;
    private Double confidence;
    private String normalizedQuery;
    private Boolean success;
}
