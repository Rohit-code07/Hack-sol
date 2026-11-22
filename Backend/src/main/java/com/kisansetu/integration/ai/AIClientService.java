package com.kisansetu.integration.ai;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AIClientService {

    private static final Logger log = LoggerFactory.getLogger(AIClientService.class);

    private final WebClient aiWebClient;

    public Optional<AIResponse> askPolicyQuestion(AIRequest request) {
        try {
            return aiWebClient.post()
                    .uri("/ai/v1/policy/ask")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AIResponse.class)
                    .timeout(Duration.ofSeconds(4))
                    .onErrorResume(e -> {
                        log.warn("AI service call /ai/v1/policy/ask failed or timed out: {}", e.getMessage());
                        return Mono.empty();
                    })
                    .blockOptional();
        } catch (Exception e) {
            log.warn("Exception invoking AI policy service: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<AIResponse> generateAIGrievance(GrievanceAIRequest request) {
        try {
            return aiWebClient.post()
                    .uri("/ai/v1/grievance/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AIResponse.class)
                    .timeout(Duration.ofSeconds(4))
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
                    .uri("/ai/v1/explanation/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AIResponse.class)
                    .timeout(Duration.ofSeconds(4))
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
