package com.kisansetu.document.controller;

import com.kisansetu.auth.entity.User;
import com.kisansetu.auth.repository.UserRepository;
import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.common.util.SecurityUtils;
import com.kisansetu.document.dto.*;
import com.kisansetu.document.entity.UploadedDocument;
import com.kisansetu.document.repository.UploadedDocumentRepository;
import com.kisansetu.document.service.DocumentIntelligenceService;
import com.kisansetu.document.service.DocumentStorageService;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Document Intelligence", description = "AI Document Upload, OCR, Classification, and Discrepancy Audit")
public class DocumentIntelligenceController {

    private final DocumentIntelligenceService documentIntelligenceService;
    private final DocumentStorageService documentStorageService;
    private final UploadedDocumentRepository uploadedDocumentRepository;
    private final FarmerRepository farmerRepository;
    private final UserRepository userRepository;

    private Farmer resolveFarmer(UUID requestedFarmerId, String username) {
        if (requestedFarmerId != null) {
            Optional<Farmer> opt = farmerRepository.findById(requestedFarmerId);
            if (opt.isPresent()) {
                return opt.get();
            }
        }
        if (username != null) {
            Optional<Farmer> opt = farmerRepository.findByUserUsername(username);
            if (opt.isPresent()) {
                return opt.get();
            }
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()) {
                Optional<Farmer> optByUserId = farmerRepository.findByUserId(userOpt.get().getId());
                if (optByUserId.isPresent()) {
                    return optByUserId.get();
                }
            }
        }
        return farmerRepository.findAll().stream().findFirst().orElse(null);
    }

    @PostMapping(value = {"/upload-and-analyze", "/analyze"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload and Analyze Document", description = "Uploads an agricultural/financial document (JPG/PNG/WEBP/PDF), extracts fields, classifies type, and detects discrepancies")
    public ResponseEntity<ApiResponse<DocumentAnalysisResponseDto>> uploadAndAnalyze(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "preferredLanguage", required = false) String preferredLanguage,
            @RequestParam(value = "language", required = false) String language,
            @RequestParam(value = "farmerId", required = false) UUID requestedFarmerId
    ) {
        String username = SecurityUtils.getCurrentUsername();
        User currentUser = username != null ? userRepository.findByUsername(username).orElse(null) : null;
        Farmer farmer = resolveFarmer(requestedFarmerId, username);

        if (farmer == null) {
            throw new IllegalStateException("Farmer profile not found. Please complete profile registration before uploading documents.");
        }

        if (currentUser == null) {
            currentUser = farmer.getUser();
        }

        String effectiveLanguage = language != null && !language.isBlank()
                ? language
                : (preferredLanguage != null && !preferredLanguage.isBlank() ? preferredLanguage : "hi");

        DocumentAnalysisResponseDto analysis = documentIntelligenceService.uploadAndAnalyzeDocument(
                file, farmer, currentUser, effectiveLanguage
        );

        return ResponseEntity.ok(ApiResponse.success(analysis, "Document uploaded and analyzed successfully."));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List Uploaded Documents", description = "Lists all documents uploaded by the authenticated farmer or specified farmer ID")
    public ResponseEntity<ApiResponse<List<DocumentSummaryDto>>> listDocuments(
            @RequestParam(value = "farmerId", required = false) UUID requestedFarmerId
    ) {
        String username = SecurityUtils.getCurrentUsername();
        Farmer farmer = resolveFarmer(requestedFarmerId, username);

        if (farmer == null) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList(), "No documents found."));
        }

        List<DocumentSummaryDto> docs = documentIntelligenceService.listFarmerDocuments(farmer.getId());
        return ResponseEntity.ok(ApiResponse.success(docs, "Documents retrieved successfully."));
    }

    @GetMapping("/{documentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get Document Analysis Details", description = "Fetches complete structured extraction, OCR text, and issues for a document")
    public ResponseEntity<ApiResponse<DocumentAnalysisResponseDto>> getDocumentDetails(
            @PathVariable UUID documentId
    ) {
        String username = SecurityUtils.getCurrentUsername();
        boolean isBankOfficer = SecurityUtils.isBankOfficer();

        UUID farmerId = null;
        if (!isBankOfficer) {
            Farmer farmer = resolveFarmer(null, username);
            if (farmer != null) {
                farmerId = farmer.getId();
            }
        }

        DocumentAnalysisResponseDto details = documentIntelligenceService.getDocumentDetails(
                documentId, farmerId, isBankOfficer
        );
        return ResponseEntity.ok(ApiResponse.success(details, "Document details retrieved successfully."));
    }

    @GetMapping("/{documentId}/file")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download or Preview Uploaded Document File", description = "Streams the raw document image or PDF for secure preview")
    public ResponseEntity<Resource> getDocumentFile(@PathVariable UUID documentId) {
        String username = SecurityUtils.getCurrentUsername();
        boolean isBankOfficer = SecurityUtils.isBankOfficer();

        UploadedDocument doc = uploadedDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + documentId));

        if (!isBankOfficer) {
            Farmer farmer = farmerRepository.findByUserUsername(username)
                    .orElseThrow(() -> new SecurityException("Unauthorized"));
            if (!doc.getFarmer().getId().equals(farmer.getId())) {
                throw new SecurityException("Unauthorized: Cannot access files of another farmer.");
            }
        }

        Resource resource = documentStorageService.loadFileAsResource(doc.getFilePath());

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (doc.getContentType() != null) {
            try {
                mediaType = MediaType.parseMediaType(doc.getContentType());
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getOriginalFilename() + "\"")
                .body(resource);
    }

    @PostMapping("/{documentId}/ask")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Ask AI About This Document", description = "Interactive follow-up questions answered strictly from the document's content and official policies")
    public ResponseEntity<ApiResponse<DocumentAskResponseDto>> askAboutDocument(
            @PathVariable UUID documentId,
            @RequestBody DocumentAskRequestDto request
    ) {
        String username = SecurityUtils.getCurrentUsername();
        boolean isBankOfficer = SecurityUtils.isBankOfficer();

        UUID farmerId = null;
        if (!isBankOfficer) {
            Farmer farmer = resolveFarmer(null, username);
            if (farmer != null) {
                farmerId = farmer.getId();
            }
        }

        DocumentAskResponseDto answer = documentIntelligenceService.askQuestionAboutDocument(
                documentId, farmerId, isBankOfficer, request
        );
        return ResponseEntity.ok(ApiResponse.success(answer, "Document Question Answered"));
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete Uploaded Document", description = "Removes document file and analysis records")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable UUID documentId) {
        String username = SecurityUtils.getCurrentUsername();
        boolean isBankOfficer = SecurityUtils.isBankOfficer();

        UUID farmerId = null;
        if (!isBankOfficer) {
            Farmer farmer = resolveFarmer(null, username);
            if (farmer != null) {
                farmerId = farmer.getId();
            }
        }

        documentIntelligenceService.deleteDocument(documentId, farmerId, isBankOfficer);
        return ResponseEntity.ok(ApiResponse.success(null, "Document deleted successfully."));
    }

    @PostMapping(value = "/voice/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Transcribe Voice Audio", description = "Transcribes farmer speech audio into text (Hindi, English, Hinglish)")
    public ResponseEntity<ApiResponse<VoiceTranscribeResponseDto>> transcribeVoice(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "language", defaultValue = "Hindi") String language
    ) {
        VoiceTranscribeResponseDto resp = documentIntelligenceService.transcribeVoiceAudio(file, language);
        return ResponseEntity.ok(ApiResponse.success(resp, "Audio transcribed successfully."));
    }
}
