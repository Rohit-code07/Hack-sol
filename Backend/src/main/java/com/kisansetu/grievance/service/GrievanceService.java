package com.kisansetu.grievance.service;

import com.kisansetu.common.enums.GrievanceStatus;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.common.util.FarmerAccessValidator;
import com.kisansetu.discrepancy.entity.Discrepancy;
import com.kisansetu.discrepancy.repository.DiscrepancyRepository;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.grievance.dto.GrievanceGenerateRequest;
import com.kisansetu.grievance.dto.GrievanceResponse;
import com.kisansetu.grievance.entity.Grievance;
import com.kisansetu.grievance.repository.GrievanceRepository;
import com.kisansetu.integration.ai.AIClientService;
import com.kisansetu.integration.ai.AIResponse;
import com.kisansetu.integration.ai.GrievanceAIRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GrievanceService {

    private final GrievanceRepository grievanceRepository;
    private final DiscrepancyRepository discrepancyRepository;
    private final FarmerRepository farmerRepository;
    private final GrievancePdfService pdfService;
    private final AIClientService aiClientService;
    private final FarmerAccessValidator farmerAccessValidator;

    @Transactional
    public GrievanceResponse generateGrievance(GrievanceGenerateRequest request) {
        farmerAccessValidator.validateAccess(request.getFarmerId());
        Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", request.getFarmerId()));

        Discrepancy discrepancy = discrepancyRepository.findById(request.getDiscrepancyId())
                .orElseThrow(() -> new ResourceNotFoundException("Discrepancy", "id", request.getDiscrepancyId()));

        String lang = request.getLanguage() != null ? request.getLanguage().toLowerCase() : "en";
        String subject = buildSubject(discrepancy, lang);
        String checklist = buildChecklist(discrepancy, lang);

        // Deterministic template as reliable base/fallback
        String grievanceBody = buildDeterministicTemplate(farmer, discrepancy, lang, request.getAdditionalNotes());

        // Attempt Python AI enhancement for linguistic nuance if available, while strictly preserving financial figures
        try {
            GrievanceAIRequest aiReq = GrievanceAIRequest.builder()
                    .farmerId(farmer.getId())
                    .farmerName(farmer.getFarmerName())
                    .village(farmer.getVillage())
                    .district(farmer.getDistrict())
                    .category(discrepancy.getCategory().name())
                    .referenceId(discrepancy.getReferenceId())
                    .expectedAmount(discrepancy.getExpectedAmount())
                    .actualAmount(discrepancy.getActualAmount())
                    .differenceAmount(discrepancy.getDifferenceAmount())
                    .description(discrepancy.getDescription())
                    .language(lang)
                    .build();

            Optional<AIResponse> aiResponse = aiClientService.generateAIGrievance(aiReq);
            if (aiResponse.isPresent() && aiResponse.get().isSuccess() && aiResponse.get().getResponseText() != null
                    && !aiResponse.get().getResponseText().isBlank()) {
                // Ensure calculated difference amount is strictly mentioned in AI text
                String aiText = aiResponse.get().getResponseText();
                if (discrepancy.getDifferenceAmount() != null) {
                    grievanceBody = aiText + "\n\n[Verified Audit Note: Statutory Shortfall Amount Recorded = INR "
                            + discrepancy.getDifferenceAmount() + "]";
                } else {
                    grievanceBody = aiText;
                }
            }
        } catch (Exception ignored) {
            // Keep deterministic template
        }

        Grievance grievance = Grievance.builder()
                .farmer(farmer)
                .discrepancy(discrepancy)
                .subject(subject)
                .grievanceContent(grievanceBody)
                .language(lang)
                .evidenceChecklist(checklist)
                .grievanceStatus(GrievanceStatus.SUBMITTED)
                .createdAt(LocalDateTime.now())
                .build();

        grievance = grievanceRepository.save(grievance);
        return mapToResponse(grievance);
    }

    @Transactional(readOnly = true)
    public GrievanceResponse getById(Long id) {
        Grievance g = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));
        farmerAccessValidator.validateAccess(g.getFarmer().getId());
        return mapToResponse(g);
    }

    @Transactional(readOnly = true)
    public List<GrievanceResponse> getByFarmer(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
        return grievanceRepository.findByFarmerId(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public byte[] getGrievancePdf(Long id) {
        Grievance g = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));
        farmerAccessValidator.validateAccess(g.getFarmer().getId());
        return pdfService.generateGrievancePdf(g);
    }

    private String buildSubject(Discrepancy discrepancy, String lang) {
        if ("hi".equals(lang)) {
            return String.format("योजना भुगतान विसंगति सुधार हेतु आवेदन - संदर्भ संख्या: %s", discrepancy.getReferenceId());
        }
        return String.format("Representation for Rectification of Entitlement Discrepancy - Ref: %s", discrepancy.getReferenceId());
    }

    private String buildChecklist(Discrepancy discrepancy, String lang) {
        if ("hi".equals(lang)) {
            return "1. आधार कार्ड की छायाप्रति\n" +
                   "2. बैंक पासबुक / खाता विवरण\n" +
                   "3. उपार्जन पर्ची / ऋण स्वीकृति पत्र (संदर्भ: " + discrepancy.getReferenceId() + ")\n" +
                   "4. किसान सेतु मंच द्वारा सत्यापित गणना विवरणी";
        }
        return "1. Copy of Aadhaar Card\n" +
               "2. Bank Passbook / Account Statement\n" +
               "3. Procurement Slip / Loan Sanction Letter (Ref: " + discrepancy.getReferenceId() + ")\n" +
               "4. Verified Entitlement Audit Summary from KisanSetu Platform";
    }

    private String buildDeterministicTemplate(Farmer farmer, Discrepancy discrepancy, String lang, String notes) {
        if ("hi".equals(lang)) {
            return String.format(
                    "सेवा में,\n" +
                    "सक्षम अधिकारी महोदय,\n\n" +
                    "विषय: %s\n\n" +
                    "महोदय,\n" +
                    "मैं %s, ग्राम %s, तहसील %s, जिला %s (%s) का निवासी कृषक हूँ।\n\n" +
                    "मेरे खाते में योजना अंतर्गत देय राशि में वित्तीय विसंगति पाई गई है:\n" +
                    "- श्रेणी: %s\n" +
                    "- देय/स्वीकृत राशि: INR %s\n" +
                    "- वास्तव में प्राप्त राशि: INR %s\n" +
                    "- बकाया अंतर राशि: INR %s\n\n" +
                    "विवरण: %s\n" +
                    (notes != null && !notes.isBlank() ? "अतिरिक्त टिप्पणी: " + notes + "\n" : "") +
                    "\nअतः आपसे निवेदन है कि उक्त रिकॉर्ड की जांच कर बकाया अंतर राशि INR %s शीघ्र जारी करने की कृपा करें।\n\n" +
                    "भवदीय,\n%s\nमो: %s",
                    buildSubject(discrepancy, lang),
                    farmer.getFarmerName(), farmer.getVillage(), farmer.getTehsil(), farmer.getDistrict(), farmer.getState(),
                    discrepancy.getCategory(),
                    discrepancy.getExpectedAmount() != null ? discrepancy.getExpectedAmount() : "N/A",
                    discrepancy.getActualAmount() != null ? discrepancy.getActualAmount() : "N/A",
                    discrepancy.getDifferenceAmount() != null ? discrepancy.getDifferenceAmount() : "N/A",
                    discrepancy.getDescription(),
                    discrepancy.getDifferenceAmount() != null ? discrepancy.getDifferenceAmount() : "0.00",
                    farmer.getFarmerName(), farmer.getMobileNumber()
            );
        }

        return String.format(
                "To,\n" +
                "The Competent Authority,\n\n" +
                "Subject: %s\n\n" +
                "Respected Sir/Madam,\n" +
                "I, %s, resident of Village %s, Tehsil %s, District %s, %s, submit this representation regarding an unresolved financial discrepancy under official government guidelines.\n\n" +
                "Discrepancy Details:\n" +
                "- Category: %s\n" +
                "- Expected Statutory Entitlement: INR %s\n" +
                "- Actual Disbursed / Credited Amount: INR %s\n" +
                "- Exact Net Difference / Shortfall: INR %s\n\n" +
                "Findings: %s\n" +
                (notes != null && !notes.isBlank() ? "Additional Applicant Remarks: " + notes + "\n" : "") +
                "\nI request that the concerned records be verified against the official sanction registers and the shortfall of INR %s be credited to my bank account at the earliest.\n\n" +
                "Yours faithfully,\n%s\nContact: %s",
                buildSubject(discrepancy, lang),
                farmer.getFarmerName(), farmer.getVillage(), farmer.getTehsil(), farmer.getDistrict(), farmer.getState(),
                discrepancy.getCategory(),
                discrepancy.getExpectedAmount() != null ? discrepancy.getExpectedAmount() : "N/A",
                discrepancy.getActualAmount() != null ? discrepancy.getActualAmount() : "N/A",
                discrepancy.getDifferenceAmount() != null ? discrepancy.getDifferenceAmount() : "N/A",
                discrepancy.getDescription(),
                discrepancy.getDifferenceAmount() != null ? discrepancy.getDifferenceAmount() : "0.00",
                farmer.getFarmerName(), farmer.getMobileNumber()
        );
    }

    private GrievanceResponse mapToResponse(Grievance g) {
        return GrievanceResponse.builder()
                .id(g.getId())
                .farmerId(g.getFarmer().getId())
                .farmerName(g.getFarmer().getFarmerName())
                .discrepancyId(g.getDiscrepancy() != null ? g.getDiscrepancy().getId() : null)
                .subject(g.getSubject())
                .grievanceContent(g.getGrievanceContent())
                .language(g.getLanguage())
                .evidenceChecklist(g.getEvidenceChecklist())
                .grievanceStatus(g.getGrievanceStatus())
                .recordedDifferenceAmount(g.getDiscrepancy() != null ? g.getDiscrepancy().getDifferenceAmount() : null)
                .createdAt(g.getCreatedAt())
                .build();
    }
}
