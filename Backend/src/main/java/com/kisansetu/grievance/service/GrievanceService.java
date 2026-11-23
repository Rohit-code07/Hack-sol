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
import com.kisansetu.grievance.dto.GrievanceStatusUpdateRequest;
import com.kisansetu.grievance.dto.GrievanceSubmitRequest;
import com.kisansetu.grievance.entity.Grievance;
import com.kisansetu.grievance.repository.GrievanceRepository;
import com.kisansetu.integration.ai.AIClientService;
import com.kisansetu.integration.ai.AIResponse;
import com.kisansetu.integration.ai.GrievanceAIRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    public GrievanceResponse submitGrievance(GrievanceSubmitRequest request) {
        Farmer farmer = null;
        if (request.getFarmerId() != null) {
            farmer = farmerRepository.findById(request.getFarmerId()).orElse(null);
        }
        if (farmer == null) {
            String currentUsername = com.kisansetu.common.util.SecurityUtils.getCurrentUsername();
            if (currentUsername != null) {
                farmer = farmerRepository.findByUserUsername(currentUsername).orElse(null);
            }
        }
        if (farmer == null) {
            throw new ResourceNotFoundException("Farmer", "id", request.getFarmerId());
        }
        farmerAccessValidator.validateAccess(farmer.getId());

        Discrepancy discrepancy = null;
        if (request.getDiscrepancyId() != null) {
            discrepancy = discrepancyRepository.findById(request.getDiscrepancyId()).orElse(null);
        }

        Grievance grievance = Grievance.builder()
                .farmer(farmer)
                .discrepancy(discrepancy)
                .grievanceCategory(request.getGrievanceCategory() != null ? request.getGrievanceCategory() : "GENERAL")
                .department(request.getDepartment() != null ? request.getDepartment() : "Agriculture & Farmers Welfare")
                .bankName(request.getBankName())
                .branchName(request.getBranchName())
                .relatedRecordReference(request.getRelatedRecordReference())
                .subject(request.getSubject())
                .grievanceContent(request.getGrievanceContent())
                .expectedResolution(request.getExpectedResolution())
                .amountInvolved(request.getAmountInvolved() != null ? request.getAmountInvolved() : BigDecimal.ZERO)
                .dateOfIncident(request.getDateOfIncident())
                .transactionId(request.getTransactionId())
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .language(request.getLanguage() != null ? request.getLanguage() : "en")
                .evidenceChecklist(request.getEvidenceChecklist())
                .grievanceStatus(GrievanceStatus.SUBMITTED)
                .createdAt(LocalDateTime.now())
                .build();

        grievance = grievanceRepository.save(grievance);
        return mapToResponse(grievance);
    }

    @Transactional
    public GrievanceResponse updateGrievanceStatus(Long id, GrievanceStatusUpdateRequest request) {
        Grievance grievance = grievanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grievance", "id", id));

        grievance.setGrievanceStatus(request.getStatus());
        if (request.getOfficerRemarks() != null) {
            grievance.setOfficerRemarks(request.getOfficerRemarks());
        }
        if (request.getResolutionDetails() != null) {
            grievance.setResolutionDetails(request.getResolutionDetails());
        }
        if (request.getStatus() == GrievanceStatus.RESOLVED) {
            grievance.setResolvedAt(LocalDateTime.now());
        }

        grievance = grievanceRepository.save(grievance);
        return mapToResponse(grievance);
    }

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

        String grievanceBody = buildDeterministicTemplate(farmer, discrepancy, lang, request.getAdditionalNotes());

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
                String aiText = aiResponse.get().getResponseText();
                if (discrepancy.getDifferenceAmount() != null) {
                    grievanceBody = aiText + "\n\n[Verified Audit Note: Statutory Shortfall Amount Recorded = INR "
                            + discrepancy.getDifferenceAmount() + "]";
                } else {
                    grievanceBody = aiText;
                }
            }
        } catch (Exception ignored) {
        }

        Grievance grievance = Grievance.builder()
                .farmer(farmer)
                .discrepancy(discrepancy)
                .grievanceCategory(discrepancy.getCategory().name())
                .subject(subject)
                .grievanceContent(grievanceBody)
                .language(lang)
                .evidenceChecklist(checklist)
                .amountInvolved(discrepancy.getDifferenceAmount() != null ? discrepancy.getDifferenceAmount() : BigDecimal.ZERO)
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
    public List<GrievanceResponse> getAllGrievances() {
        return grievanceRepository.findAll().stream()
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

    private String buildSubject(Discrepancy d, String lang) {
        if ("hi".equalsIgnoreCase(lang)) {
            return String.format("शिकायत: %s के तहत वित्तीय विसंगति (संदर्भ: %s)",
                    d.getCategory(), d.getReferenceId());
        }
        return String.format("Formal Grievance: Financial Discrepancy under %s (Ref: %s)",
                d.getCategory(), d.getReferenceId());
    }

    private String buildChecklist(Discrepancy d, String lang) {
        if ("hi".equalsIgnoreCase(lang)) {
            return "1. आधार कार्ड की स्वप्रमाणित प्रति\n" +
                   "2. बैंक पासबुक / खाते का विवरण\n" +
                   "3. संबंधित योजना का स्वीकृति पत्र अथवा रसीद (संदर्भ: " + d.getReferenceId() + ")\n" +
                   "4. राजस्व भू-अभिलेख खतौनी (यदि भूमि से संबंधित हो)";
        }
        return "1. Self-attested copy of Aadhaar Card\n" +
               "2. Bank Passbook / Detailed Account Statement\n" +
               "3. Relevant Scheme Sanction Order or Payment Receipt (Ref: " + d.getReferenceId() + ")\n" +
               "4. Revenue Land Record Copy (7/12 or RoR if applicable)";
    }

    private String buildDeterministicTemplate(Farmer farmer, Discrepancy discrepancy, String lang, String notes) {
        if ("hi".equalsIgnoreCase(lang)) {
            return String.format(
                    "सेवा में,\n" +
                    "सक्षम प्राधिकारी महोदय,\n\n" +
                    "विषय: %s\n\n" +
                    "महोदय,\n" +
                    "मैं %s, ग्राम %s, तहसील %s, जिला %s (%s) का निवासी हूँ। मैं निम्नलिखित योजना में हुए वित्तीय अंतर के समाधान हेतु यह आवेदन प्रस्तुत कर रहा हूँ:\n\n" +
                    "विसंगति का विवरण:\n" +
                    "- श्रेणी: %s\n" +
                    "- अपेक्षित कानूनी पात्रता: ₹ %s\n" +
                    "- वास्तविक प्राप्त / जमा राशि: ₹ %s\n" +
                    "- शुद्ध अंतर (शॉर्टफॉल): ₹ %s\n\n" +
                    "निष्कर्ष: %s\n" +
                    (notes != null && !notes.isBlank() ? "आवेदक की अतिरिक्त टिप्पणी: " + notes + "\n" : "") +
                    "\nअतः आपसे विनम्र निवेदन है कि रिकॉर्ड का सत्यापन कर शेष देय राशि ₹ %s मेरे बैंक खाते में शीघ्र हस्तांतरित करने की कृपा करें।\n\n" +
                    "भवदीय,\n%s\nमोबाइल: %s",
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
                .grievanceCategory(g.getGrievanceCategory() != null ? g.getGrievanceCategory() : "GENERAL")
                .department(g.getDepartment())
                .bankName(g.getBankName())
                .branchName(g.getBranchName())
                .relatedRecordReference(g.getRelatedRecordReference())
                .subject(g.getSubject())
                .grievanceContent(g.getGrievanceContent())
                .expectedResolution(g.getExpectedResolution())
                .amountInvolved(g.getAmountInvolved())
                .dateOfIncident(g.getDateOfIncident())
                .transactionId(g.getTransactionId())
                .priority(g.getPriority() != null ? g.getPriority() : "MEDIUM")
                .language(g.getLanguage())
                .evidenceChecklist(g.getEvidenceChecklist())
                .grievanceStatus(g.getGrievanceStatus())
                .officerRemarks(g.getOfficerRemarks())
                .resolutionDetails(g.getResolutionDetails())
                .resolvedAt(g.getResolvedAt())
                .recordedDifferenceAmount(g.getDiscrepancy() != null ? g.getDiscrepancy().getDifferenceAmount() : g.getAmountInvolved())
                .createdAt(g.getCreatedAt())
                .build();
    }
}
