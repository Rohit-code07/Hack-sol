package com.kisansetu.integration.ai;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AIClientService {

    private static final Logger log = LoggerFactory.getLogger(AIClientService.class);

    private final WebClient aiWebClient;

    public Map<String, Object> checkHealth() {
        try {
            return aiWebClient.get()
                    .uri("/api/ai/health")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        log.warn("AI health check /api/ai/health failed: {}, trying /health", e.getMessage());
                        return aiWebClient.get()
                                .uri("/health")
                                .retrieve()
                                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                                .timeout(Duration.ofSeconds(3));
                    })
                    .onErrorReturn(Map.of(
                            "status", "DOWN",
                            "message", "AI service is currently unreachable"
                    ))
                    .blockOptional()
                    .orElse(Map.of("status", "DOWN"));
        } catch (Exception e) {
            log.warn("Exception checking AI service health: {}", e.getMessage());
            return Map.of("status", "DOWN", "error", e.getMessage() != null ? e.getMessage() : "Unknown error");
        }
    }

    public Optional<AIResponse> askPolicyQuestion(AIRequest request) {
        String queryText = request.getEffectiveQuestion();
        String lang = request.getLanguage() != null ? request.getLanguage() : "hi";
        boolean isHindi = "hi".equalsIgnoreCase(lang) || "hindi".equalsIgnoreCase(lang);

        Map<String, Object> payload = new HashMap<>();
        payload.put("question", queryText);
        payload.put("query", queryText);
        payload.put("language", lang);
        if (request.getScheme() != null) payload.put("scheme", request.getScheme());
        if (request.getDocumentId() != null) payload.put("document_id", request.getDocumentId());
        if (request.getConversationId() != null) payload.put("conversationId", request.getConversationId());

        try {
            return aiWebClient.post()
                    .uri("/api/ai/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(AIResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .onErrorResume(e -> {
                        log.warn("AI service call /api/ai/chat failed: {}, falling back to /ai/v1/policy/ask", e.getMessage());
                        return aiWebClient.post()
                                .uri("/ai/v1/policy/ask")
                                .contentType(MediaType.APPLICATION_JSON)
                                .bodyValue(payload)
                                .retrieve()
                                .bodyToMono(AIResponse.class)
                                .timeout(Duration.ofSeconds(15));
                    })
                    .onErrorResume(e -> {
                        log.warn("AI service call failed completely: {}", e.getMessage());
                        AIResponse fallback = AIResponse.builder()
                                .success(false)
                                .answer(isHindi ? 
                                        "सरकारी कृषि योजनाओं (KCC, MSP, PMFBY) की जानकारी के लिए कृपया नजदीकी कृषि विज्ञान केंद्र अथवा बैंक शाखा से संपर्क करें। AI सेवा वर्तमान में उपलब्ध नहीं है।" :
                                        "For official agricultural scheme details (KCC, MSP, PMFBY), please visit your nearest Krishi Vigyan Kendra or bank branch. AI service is temporarily offline.")
                                .language(lang)
                                .confidence("OFFLINE_FALLBACK")
                                .sources(Collections.emptyList())
                                .build();
                        return Mono.just(fallback);
                    })
                    .blockOptional();
        } catch (Exception e) {
            log.warn("Exception invoking AI policy service: {}", e.getMessage());
            AIResponse fallback = AIResponse.builder()
                    .success(false)
                    .answer(isHindi ? 
                            "एआई नीति सहायक से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।" :
                            "Unable to communicate with AI Policy Assistant. Please try again later.")
                    .language(lang)
                    .confidence("OFFLINE_FALLBACK")
                    .build();
            return Optional.of(fallback);
        }
    }

    public Map<String, Object> searchPolicies(Map<String, Object> searchRequest) {
        try {
            return aiWebClient.post()
                    .uri("/api/ai/search")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(searchRequest)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .timeout(Duration.ofSeconds(10))
                    .onErrorReturn(Map.of("results", Collections.emptyList(), "message", "AI search unavailable"))
                    .blockOptional()
                    .orElse(Map.of("results", Collections.emptyList()));
        } catch (Exception e) {
            log.warn("Exception searching policies: {}", e.getMessage());
            return Map.of("results", Collections.emptyList(), "error", e.getMessage() != null ? e.getMessage() : "Search error");
        }
    }

    public Optional<AIResponse> generateAIGrievance(GrievanceAIRequest request) {
        try {
            return aiWebClient.post()
                    .uri("/api/ai/grievance/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AIResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .onErrorResume(e -> {
                        log.warn("AI service call /api/ai/grievance/generate failed: {}, falling back to /ai/v1/grievance/generate", e.getMessage());
                        return aiWebClient.post()
                                .uri("/ai/v1/grievance/generate")
                                .contentType(MediaType.APPLICATION_JSON)
                                .bodyValue(request)
                                .retrieve()
                                .bodyToMono(AIResponse.class)
                                .timeout(Duration.ofSeconds(15));
                    })
                    .onErrorResume(e -> {
                        log.warn("AI service call /ai/v1/grievance/generate failed or timed out: {}", e.getMessage());
                        return Mono.empty();
                    })
                    .blockOptional();
        } catch (Exception e) {
            log.warn("Exception invoking AI grievance service: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<AIResponse> generateAIExplanation(ExplanationAIRequest request) {
        try {
            return aiWebClient.post()
                    .uri("/api/ai/discrepancy/explain")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AIResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .onErrorResume(e -> {
                        log.warn("AI service call /api/ai/discrepancy/explain failed: {}, falling back to /ai/v1/explanation/generate", e.getMessage());
                        return aiWebClient.post()
                                .uri("/ai/v1/explanation/generate")
                                .contentType(MediaType.APPLICATION_JSON)
                                .bodyValue(request)
                                .retrieve()
                                .bodyToMono(AIResponse.class)
                                .timeout(Duration.ofSeconds(15));
                    })
                    .onErrorResume(e -> {
                        log.warn("AI service call /ai/v1/explanation/generate failed or timed out: {}", e.getMessage());
                        return Mono.empty();
                    })
                    .blockOptional();
        } catch (Exception e) {
            log.warn("Exception invoking AI explanation service: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
