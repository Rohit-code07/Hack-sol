package com.kisansetu.integration.ai;

import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.common.util.SecurityUtils;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.grievance.repository.GrievanceRepository;
import com.kisansetu.land.repository.LandRecordRepository;
import com.kisansetu.loan.entity.LoanRecord;
import com.kisansetu.loan.repository.LoanRecordRepository;
import com.kisansetu.scheme.entity.MspTransaction;
import com.kisansetu.scheme.repository.InsuranceRecordRepository;
import com.kisansetu.scheme.repository.MspTransactionRepository;
import com.kisansetu.document.dto.VoiceTranscribeResponseDto;
import com.kisansetu.document.service.DocumentIntelligenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping({"/api/v1/ai", "/api/ai"})
@RequiredArgsConstructor
@Tag(name = "AI Transparency Gateway", description = "Endpoints for RAG Policy Assistant, Grievance Drafting, and Discrepancy Explanations")
public class AiController {

    private final AIClientService aiClientService;
    private final FarmerRepository farmerRepository;
    private final LoanRecordRepository loanRecordRepository;
    private final LandRecordRepository landRecordRepository;
    private final MspTransactionRepository mspTransactionRepository;
    private final InsuranceRecordRepository insuranceRecordRepository;
    private final GrievanceRepository grievanceRepository;
    private final DocumentIntelligenceService documentIntelligenceService;

    @GetMapping("/health")
    @Operation(summary = "Check AI Service Health", description = "Verifies FastAPI, LLM provider, and ChromaDB status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        Map<String, Object> health = aiClientService.checkHealth();
        return ResponseEntity.ok(ApiResponse.success(health, "AI Service Health Status"));
    }

    @PostMapping({"/chat", "/query", "/ask"})
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Ask Policy RAG Assistant", description = "Answers farmer queries strictly using verified government policy documents and actual farmer records")
    public ResponseEntity<ApiResponse<AIResponse>> chat(@RequestBody AIRequest request) {
        // Automatically inject authenticated farmer's authorized live records into context if applicable
        String username = SecurityUtils.getCurrentUsername();
        if (username != null) {
            Optional<Farmer> farmerOpt = farmerRepository.findByUserUsername(username);
            if (farmerOpt.isPresent()) {
                Farmer farmer = farmerOpt.get();
                Map<String, Object> ctx = request.getContext() != null ? new HashMap<>(request.getContext()) : new HashMap<>();

                List<LoanRecord> loans = loanRecordRepository.findByFarmerId(farmer.getId());
                BigDecimal totalOutstanding = loans.stream()
                        .map(l -> l.getOutstandingAmount() != null ? l.getOutstandingAmount() : l.getDisbursedAmount())
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                List<MspTransaction> mspList = mspTransactionRepository.findByFarmerId(farmer.getId());
                BigDecimal totalMspExpected = mspList.stream()
                        .map(m -> m.getGrossProcurementAmount().subtract(m.getDocumentedDeductions()))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal totalMspReceived = mspList.stream()
                        .map(MspTransaction::getActualPayment)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal pendingMsp = totalMspExpected.subtract(totalMspReceived).max(BigDecimal.ZERO);

                ctx.put("farmerName", farmer.getFarmerName());
                ctx.put("village", farmer.getVillage());
                ctx.put("district", farmer.getDistrict());
                ctx.put("landArea", farmer.getTotalLandArea() + " ACRE");
                ctx.put("activeLoansCount", loans.size());
                ctx.put("totalOutstandingLoan", totalOutstanding.toString());
                ctx.put("pendingMspPayment", pendingMsp.toString());
                ctx.put("grievancesCount", grievanceRepository.findByFarmerId(farmer.getId()).size());

                request.setContext(ctx);
            }
        }

        AIResponse response = aiClientService.askPolicyQuestion(request)
                .orElse(AIResponse.builder()
                        .success(false)
                        .answer("AI service is currently unavailable. Please try again shortly.")
                        .language(request.getLanguage() != null ? request.getLanguage() : "hi")
                        .confidence("UNAVAILABLE")
                        .build());
        return ResponseEntity.ok(ApiResponse.success(response, "Policy Query Response"));
    }

    @PostMapping("/policies/search")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Semantic Search across Policy Documents", description = "Retrieves relevant policy clauses without LLM generation")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchPolicies(@RequestBody Map<String, Object> searchRequest) {
        Map<String, Object> result = aiClientService.searchPolicies(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(result, "Policy Search Results"));
    }

    @PostMapping("/grievance/generate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Generate AI Grievance Petition", description = "Drafts a formal, legally structured grievance draft with supporting evidence checklist")
    public ResponseEntity<ApiResponse<AIResponse>> generateGrievance(@RequestBody GrievanceAIRequest request) {
        AIResponse response = aiClientService.generateAIGrievance(request)
                .orElse(AIResponse.builder()
                        .success(false)
                        .responseText("Failed to generate AI grievance petition. Please use standard form.")
                        .language(request.getLanguage() != null ? request.getLanguage() : "hi")
                        .build());
        return ResponseEntity.ok(ApiResponse.success(response, "Grievance Generated"));
    }

    @PostMapping("/discrepancy/explain")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Generate AI Discrepancy Breakdown", description = "Translates technical audit discrepancies into plain-language explanation and actionable steps")
    public ResponseEntity<ApiResponse<AIResponse>> explainDiscrepancy(@RequestBody ExplanationAIRequest request) {
        AIResponse response = aiClientService.generateAIExplanation(request)
                .orElse(AIResponse.builder()
                        .success(false)
                        .responseText("Explanation service unavailable. Please review the official audit report.")
                        .language(request.getTargetLanguage() != null ? request.getTargetLanguage() : "hi")
                        .build());
        return ResponseEntity.ok(ApiResponse.success(response, "Discrepancy Breakdown Generated"));
    }

    @PostMapping(value = "/voice/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Transcribe Voice Input", description = "Converts spoken Hindi, English, or Hinglish audio into text for RAG queries")
    public ResponseEntity<ApiResponse<VoiceTranscribeResponseDto>> transcribeVoice(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "language", defaultValue = "Hindi") String language
    ) {
        VoiceTranscribeResponseDto resp = documentIntelligenceService.transcribeVoiceAudio(file, language);
        return ResponseEntity.ok(ApiResponse.success(resp, "Audio Transcribed Successfully"));
    }
}
