package com.kisansetu.formassistant.controller;

import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.formassistant.dto.FormExtractResponseDto;
import com.kisansetu.formassistant.dto.VoiceFormExtractRequestDto;
import com.kisansetu.formassistant.service.FormAssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/form-assistant")
@RequiredArgsConstructor
@Tag(name = "Universal Form Assistant", description = "AI-Powered Voice and Document Smart Form Filling APIs")
public class FormAssistantController {

    private final FormAssistantService formAssistantService;

    @PostMapping(value = "/voice-extract", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Voice-to-Form Field Extraction",
            description = "Extracts and populates form fields from transcribed speech according to active form schema")
    public ResponseEntity<ApiResponse<FormExtractResponseDto>> extractVoice(
            @RequestBody VoiceFormExtractRequestDto request
    ) {
        FormExtractResponseDto result = formAssistantService.extractVoiceFields(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Voice extraction completed"));
    }

    @PostMapping(value = "/document-extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Document-to-Form Field Extraction",
            description = "Extracts and populates form fields from uploaded document image or PDF according to active form schema")
    public ResponseEntity<ApiResponse<FormExtractResponseDto>> extractDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("formSchema") String formSchema,
            @RequestParam(value = "currentValues", required = false) String currentValues,
            @RequestParam(value = "language", defaultValue = "hi") String language
    ) {
        FormExtractResponseDto result = formAssistantService.extractDocumentFields(file, formSchema, currentValues, language);
        return ResponseEntity.ok(ApiResponse.success(result, "Document extraction completed"));
    }
}
