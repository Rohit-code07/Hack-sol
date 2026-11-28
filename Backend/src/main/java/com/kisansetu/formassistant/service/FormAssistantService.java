package com.kisansetu.formassistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisansetu.formassistant.dto.FormExtractResponseDto;
import com.kisansetu.formassistant.dto.VoiceFormExtractRequestDto;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class FormAssistantService {

    private static final Logger log = LoggerFactory.getLogger(FormAssistantService.class);

    private final WebClient aiWebClient;
    private final ObjectMapper objectMapper;

    /**
     * Extracts form fields from transcribed speech using the AI service.
     */
    public FormExtractResponseDto extractVoiceFields(VoiceFormExtractRequestDto request) {
        log.info("Processing voice form extraction for form: {}, language: {}",
                request.getFormSchema() != null ? request.getFormSchema().getFormId() : "unknown",
                request.getLanguage());

        try {
            FormExtractResponseDto response = aiWebClient.post()
                    .uri("/api/ai/form-assistant/voice-extract")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(FormExtractResponseDto.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response != null) {
                return response;
            }
        } catch (Exception ex) {
            log.warn("FastAPI voice extraction call failed: {}. Falling back to empty response.", ex.getMessage());
        }

        return buildFallbackResponse(
                request.getFormSchema() != null ? request.getFormSchema().getFormId() : "unknown",
                "voice",
                request.getLanguage()
        );
    }

    /**
     * Extracts form fields from an uploaded document image or PDF using the AI service.
     */
    public FormExtractResponseDto extractDocumentFields(
            MultipartFile file,
            String formSchemaJson,
            String currentValuesJson,
            String language
    ) {
        String formId = "unknown";
        try {
            if (formSchemaJson != null && formSchemaJson.contains("formId")) {
                var node = objectMapper.readTree(formSchemaJson);
                if (node.has("formId")) {
                    formId = node.get("formId").asText();
                }
            }
        } catch (Exception ignored) {}

        log.info("Processing document form extraction for form: {}, file: {}, size: {} bytes",
                formId, file.getOriginalFilename(), file.getSize());

        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
                }
            };

            builder.part("file", resource)
                    .header("Content-Type", file.getContentType() != null ? file.getContentType() : "application/octet-stream");
            builder.part("form_schema", formSchemaJson != null ? formSchemaJson : "{}");
            builder.part("current_values", currentValuesJson != null ? currentValuesJson : "{}");
            builder.part("language", language != null ? language : "hi");

            MultiValueMap<String, HttpEntity<?>> multipartBody = builder.build();

            FormExtractResponseDto response = aiWebClient.post()
                    .uri("/api/ai/form-assistant/document-extract")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(multipartBody))
                    .retrieve()
                    .bodyToMono(FormExtractResponseDto.class)
                    .timeout(Duration.ofSeconds(45))
                    .block();

            if (response != null) {
                return response;
            }
        } catch (Exception ex) {
            log.warn("FastAPI document extraction call failed: {}. Falling back to empty response.", ex.getMessage());
        }

        return buildFallbackResponse(formId, "document", language);
    }

    private FormExtractResponseDto buildFallbackResponse(String formId, String source, String language) {
        return FormExtractResponseDto.builder()
                .formId(formId)
                .success(false)
                .extractedFields(new HashMap<>())
                .conflicts(Collections.emptyList())
                .summary("Unable to process form input via AI service at this time. Please fill the fields manually.")
                .unmatchedNotes("")
                .source(source)
                .language(language != null ? language : "hi")
                .build();
    }
}
