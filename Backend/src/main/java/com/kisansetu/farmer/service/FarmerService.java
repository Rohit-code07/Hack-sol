package com.kisansetu.farmer.service;

import com.kisansetu.auth.entity.User;
import com.kisansetu.auth.repository.UserRepository;
import com.kisansetu.common.enums.GrievanceStatus;
import com.kisansetu.common.enums.RepaymentStatus;
import com.kisansetu.common.exception.DuplicateResourceException;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.common.util.FarmerAccessValidator;
import com.kisansetu.common.util.SecurityUtils;
import com.kisansetu.discrepancy.dto.DiscrepancyResponse;
import com.kisansetu.discrepancy.entity.Discrepancy;
import com.kisansetu.discrepancy.repository.DiscrepancyRepository;
import com.kisansetu.discrepancy.service.DiscrepancyService;
import com.kisansetu.farmer.dto.FarmerDashboardResponse;
import com.kisansetu.farmer.dto.FarmerRequest;
import com.kisansetu.farmer.dto.FarmerResponse;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.grievance.dto.GrievanceResponse;
import com.kisansetu.grievance.entity.Grievance;
import com.kisansetu.grievance.repository.GrievanceRepository;
import com.kisansetu.land.dto.LandRecordResponse;
import com.kisansetu.land.entity.LandRecord;
import com.kisansetu.land.repository.LandRecordRepository;
import com.kisansetu.loan.dto.LoanRecordResponse;
import com.kisansetu.loan.entity.LoanRecord;
import com.kisansetu.loan.repository.LoanRecordRepository;
import com.kisansetu.scheme.entity.InsuranceRecord;
import com.kisansetu.scheme.entity.MspTransaction;
import com.kisansetu.scheme.repository.InsuranceRecordRepository;
import com.kisansetu.scheme.repository.MspTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmerService {

    private final FarmerRepository farmerRepository;
    private final UserRepository userRepository;
    private final LandRecordRepository landRecordRepository;
    private final LoanRecordRepository loanRecordRepository;
    private final DiscrepancyRepository discrepancyRepository;
    private final GrievanceRepository grievanceRepository;
    private final MspTransactionRepository mspTransactionRepository;
    private final InsuranceRecordRepository insuranceRecordRepository;
    private final DiscrepancyService discrepancyService;
    private final FarmerAccessValidator farmerAccessValidator;

    @Transactional
    public FarmerResponse registerFarmer(FarmerRequest request) {
        if (farmerRepository.findByMobileNumber(request.getMobileNumber()).isPresent()) {
            throw new DuplicateResourceException("Farmer already registered with mobile: " + request.getMobileNumber());
        }

        String username = SecurityUtils.getCurrentUsername();
        User user = null;
        if (username != null) {
            user = userRepository.findByUsername(username).orElse(null);
        }

        Farmer farmer = Farmer.builder()
                .user(user)
                .farmerName(request.getFarmerName())
                .fatherSpouseName(request.getFatherSpouseName())
                .dob(request.getDob())
                .gender(request.getGender() != null ? request.getGender() : "Male")
                .mobileNumber(request.getMobileNumber())
                .alternateMobile(request.getAlternateMobile())
                .aadhaarNumber(maskAadhaar(request.getAadhaarNumber()))
                .category(request.getCategory() != null ? request.getCategory() : "General")
                .address(request.getAddress())
                .village(request.getVillage())
                .tehsil(request.getTehsil())
                .district(request.getDistrict())
                .state(request.getState())
                .pinCode(request.getPinCode())
                .farmerType(request.getFarmerType() != null ? request.getFarmerType() : "Individual")
                .farmingType(request.getFarmingType() != null ? request.getFarmingType() : "Owner")
                .primaryCrop(request.getPrimaryCrop() != null ? request.getPrimaryCrop() : "Paddy")
                .secondaryCrops(request.getSecondaryCrops())
                .totalLandArea(request.getTotalLandArea() != null ? request.getTotalLandArea() : BigDecimal.ZERO)
                .irrigationAvailable(request.getIrrigationAvailable() != null ? request.getIrrigationAvailable() : false)
                .irrigationType(request.getIrrigationType() != null ? request.getIrrigationType() : "Rainfed")
                .soilType(request.getSoilType() != null ? request.getSoilType() : "Alluvial")
                .documentsJson(request.getDocumentsJson())
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "hi")
                .createdAt(LocalDateTime.now())
                .build();

        farmer.setProfileCompletionPercentage(farmer.calculateCompletionPercentage());
        farmer = farmerRepository.save(farmer);
        return mapToResponse(farmer);
    }

    @Transactional(readOnly = true)
    public FarmerResponse getFarmerProfile(UUID farmerId) {
        validateAccess(farmerId);
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", farmerId));
        return mapToResponse(farmer);
    }

    @Transactional
    public FarmerResponse updateFarmerProfile(UUID farmerId, FarmerRequest request) {
        validateAccess(farmerId);
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", farmerId));

        if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank() && !request.getMobileNumber().equals(farmer.getMobileNumber())) {
            var existing = farmerRepository.findByMobileNumber(request.getMobileNumber());
            if (existing.isPresent() && !existing.get().getId().equals(farmerId)) {
                throw new DuplicateResourceException("Mobile number already in use: " + request.getMobileNumber());
            }
            farmer.setMobileNumber(request.getMobileNumber());
        }

        if (request.getFarmerName() != null && !request.getFarmerName().isBlank()) farmer.setFarmerName(request.getFarmerName());
        if (request.getFatherSpouseName() != null) farmer.setFatherSpouseName(request.getFatherSpouseName());
        if (request.getDob() != null) farmer.setDob(request.getDob());
        if (request.getGender() != null) farmer.setGender(request.getGender());
        if (request.getAlternateMobile() != null) farmer.setAlternateMobile(request.getAlternateMobile());
        if (request.getAadhaarNumber() != null && !request.getAadhaarNumber().isBlank()) {
            farmer.setAadhaarNumber(maskAadhaar(request.getAadhaarNumber()));
        }
        if (request.getCategory() != null) farmer.setCategory(request.getCategory());
        if (request.getAddress() != null) farmer.setAddress(request.getAddress());
        if (request.getVillage() != null) farmer.setVillage(request.getVillage());
        if (request.getTehsil() != null) farmer.setTehsil(request.getTehsil());
        if (request.getDistrict() != null) farmer.setDistrict(request.getDistrict());
        if (request.getState() != null) farmer.setState(request.getState());
        if (request.getPinCode() != null) farmer.setPinCode(request.getPinCode());
        if (request.getFarmerType() != null) farmer.setFarmerType(request.getFarmerType());
        if (request.getFarmingType() != null) farmer.setFarmingType(request.getFarmingType());
        if (request.getPrimaryCrop() != null) farmer.setPrimaryCrop(request.getPrimaryCrop());
        if (request.getSecondaryCrops() != null) farmer.setSecondaryCrops(request.getSecondaryCrops());
        if (request.getTotalLandArea() != null) farmer.setTotalLandArea(request.getTotalLandArea());
        if (request.getIrrigationAvailable() != null) farmer.setIrrigationAvailable(request.getIrrigationAvailable());
        if (request.getIrrigationType() != null) farmer.setIrrigationType(request.getIrrigationType());
        if (request.getSoilType() != null) farmer.setSoilType(request.getSoilType());
        if (request.getDocumentsJson() != null) farmer.setDocumentsJson(request.getDocumentsJson());
        if (request.getPreferredLanguage() != null) farmer.setPreferredLanguage(request.getPreferredLanguage());

        farmer.setProfileCompletionPercentage(farmer.calculateCompletionPercentage());
        farmer = farmerRepository.save(farmer);
        return mapToResponse(farmer);
    }

    @Transactional(readOnly = true)
    public FarmerDashboardResponse getDashboard(UUID farmerId) {
        validateAccess(farmerId);
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", farmerId));

        // Land
        List<LandRecord> parcels = landRecordRepository.findParcelsByFarmerId(farmerId);
        BigDecimal totalArea = parcels.stream()
                .map(LandRecord::getLandArea)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Loans
        List<LoanRecord> loans = loanRecordRepository.findByFarmerId(farmerId);
        List<LoanRecord> activeLoans = loans.stream()
                .filter(l -> l.getRepaymentStatus() == RepaymentStatus.ACTIVE)
                .toList();

        BigDecimal totalSanctioned = loans.stream()
                .map(LoanRecord::getSanctionedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDisbursed = loans.stream()
                .map(LoanRecord::getDisbursedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOutstanding = loans.stream()
                .map(l -> l.getOutstandingAmount() != null ? l.getOutstandingAmount() : l.getDisbursedAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSubsidy = loans.stream()
                .map(l -> l.getSubsidyAmountReceived() != null ? l.getSubsidyAmountReceived() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Discrepancies
        List<Discrepancy> discrepancies = discrepancyRepository.findByFarmerId(farmerId);
        BigDecimal totalDiscrepancyDiff = discrepancies.stream()
                .map(d -> d.getDifferenceAmount() != null ? d.getDifferenceAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Grievances
        List<Grievance> grievances = grievanceRepository.findByFarmerId(farmerId);
        int activeGrievances = (int) grievances.stream()
                .filter(g -> g.getGrievanceStatus() != GrievanceStatus.RESOLVED && g.getGrievanceStatus() != GrievanceStatus.REJECTED)
                .count();
        int resolvedGrievances = (int) grievances.stream()
                .filter(g -> g.getGrievanceStatus() == GrievanceStatus.RESOLVED)
                .count();

        // MSP Transactions
        List<MspTransaction> mspList = mspTransactionRepository.findByFarmerId(farmerId);
        BigDecimal totalMspExpected = mspList.stream()
                .map(m -> m.getGrossProcurementAmount().subtract(m.getDocumentedDeductions()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalMspReceived = mspList.stream()
                .map(MspTransaction::getActualPayment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingMsp = totalMspExpected.subtract(totalMspReceived).max(BigDecimal.ZERO);

        // Insurance Records
        List<InsuranceRecord> insList = insuranceRecordRepository.findByFarmerId(farmerId);
        int claimsCount = (int) insList.stream()
                .filter(i -> i.getClaimNumber() != null && !i.getClaimNumber().isBlank())
                .count();

        int pendingClaims = (int) insList.stream()
                .filter(i -> "UNDER_REVIEW".equalsIgnoreCase(i.getClaimStatus()) || "PENDING".equalsIgnoreCase(i.getClaimStatus()))
                .count();

        BigDecimal totalClaimsAmount = insList.stream()
                .map(i -> i.getClaimAmount() != null ? i.getClaimAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalInsurancePayout = insList.stream()
                .map(i -> i.getActualPayout() != null ? i.getActualPayout() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int profilePct = farmer.getProfileCompletionPercentage() != null
                ? farmer.getProfileCompletionPercentage()
                : farmer.calculateCompletionPercentage();

        return FarmerDashboardResponse.builder()
                .profile(mapToResponse(farmer))
                .profileCompletionPercentage(profilePct)
                .totalLandParcels(parcels.size())
                .totalLandAreaInAcres(totalArea)
                .totalLoansCount(loans.size())
                .activeLoansCount(activeLoans.size())
                .totalSanctionedLoanAmount(totalSanctioned)
                .totalDisbursedLoanAmount(totalDisbursed)
                .totalOutstandingLoanAmount(totalOutstanding)
                .totalSubsidyReceived(totalSubsidy)
                .mspTransactionsCount(mspList.size())
                .expectedMspAmount(totalMspExpected)
                .receivedMspAmount(totalMspReceived)
                .pendingMspAmount(pendingMsp)
                .insurancePoliciesCount(insList.size())
                .insuranceClaimsCount(claimsCount)
                .pendingInsuranceClaimsCount(pendingClaims)
                .totalInsuranceClaimsAmount(totalClaimsAmount)
                .totalInsurancePayoutReceived(totalInsurancePayout)
                .detectedDiscrepanciesCount(discrepancies.size())
                .totalDiscrepancyDifferenceAmount(totalDiscrepancyDiff)
                .submittedGrievancesCount(grievances.size())
                .activeGrievancesCount(activeGrievances)
                .resolvedGrievancesCount(resolvedGrievances)
                .build();
    }

    @Transactional(readOnly = true)
    public List<LandRecordResponse> getLandRecords(UUID farmerId) {
        validateAccess(farmerId);
        List<LandRecord> parcels = landRecordRepository.findParcelsByFarmerId(farmerId);
        return parcels.stream()
                .map(lr -> LandRecordResponse.builder()
                        .id(lr.getId())
                        .khasraNumber(lr.getKhasraNumber())
                        .khataNumber(lr.getKhataNumber())
                        .surveyNumber(lr.getSurveyNumber())
                        .village(lr.getVillage())
                        .tehsil(lr.getTehsil())
                        .district(lr.getDistrict())
                        .state(lr.getState())
                        .landArea(lr.getLandArea())
                        .areaUnit(lr.getAreaUnit())
                        .ownerName(lr.getOwnerName())
                        .coOwnerDetails(lr.getCoOwnerDetails())
                        .irrigationStatus(lr.getIrrigationStatus())
                        .landUsage(lr.getLandUsage())
                        .isMortgaged(lr.getIsMortgaged())
                        .isCollateral(lr.getIsCollateral())
                        .verificationStatus(lr.getVerificationStatus() != null ? lr.getVerificationStatus() : "PENDING")
                        .verificationRemarks(lr.getVerificationRemarks())
                        .ownershipStatus(lr.getOwnershipStatus())
                        .fullGeoIdentity(lr.getFullGeoIdentity())
                        .createdAt(lr.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanRecordResponse> getLoans(UUID farmerId) {
        validateAccess(farmerId);
        List<LoanRecord> loans = loanRecordRepository.findByFarmerId(farmerId);
        return loans.stream()
                .map(l -> LoanRecordResponse.builder()
                        .id(l.getId())
                        .farmerId(l.getFarmer().getId())
                        .farmerName(l.getFarmer().getFarmerName())
                        .bankId(l.getBank().getId())
                        .bankName(l.getBank().getBankName())
                        .branchName(l.getBank().getBranchName())
                        .ifscCode(l.getBank().getIfscCode())
                        .loanAccountReference(l.getLoanAccountReference())
                        .loanType(l.getLoanType())
                        .sanctionedAmount(l.getSanctionedAmount())
                        .disbursedAmount(l.getDisbursedAmount())
                        .outstandingAmount(l.getOutstandingAmount())
                        .interestRate(l.getInterestRate())
                        .loanPurpose(l.getLoanPurpose())
                        .cropSeason(l.getCropSeason())
                        .cropName(l.getCropName())
                        .linkedKhasra(l.getLinkedKhasra())
                        .subsidyApplied(l.getSubsidyApplied())
                        .subsidyReceived(l.getSubsidyReceived())
                        .subsidyAmountReceived(l.getSubsidyAmountReceived())
                        .lastPaymentDate(l.getLastPaymentDate())
                        .disbursementDate(l.getDisbursementDate())
                        .maturityDate(l.getMaturityDate())
                        .repaymentStatus(l.getRepaymentStatus())
                        .verificationStatus(l.getVerificationStatus())
                        .duplicateFlag(l.getDuplicateFlag())
                        .createdAt(l.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DiscrepancyResponse> getDiscrepancies(UUID farmerId) {
        validateAccess(farmerId);
        return discrepancyRepository.findByFarmerId(farmerId).stream()
                .map(discrepancyService::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GrievanceResponse> getGrievances(UUID farmerId) {
        validateAccess(farmerId);
        return grievanceRepository.findByFarmerId(farmerId).stream()
                .map(g -> GrievanceResponse.builder()
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
                        .build())
                .collect(Collectors.toList());
    }

    public void validateAccess(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
    }

    private String maskAadhaar(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String clean = raw.replaceAll("\\s|-", "");
        if (clean.length() == 12) {
            return "XXXX-XXXX-" + clean.substring(8);
        }
        return raw;
    }

    private FarmerResponse mapToResponse(Farmer f) {
        return FarmerResponse.builder()
                .id(f.getId())
                .userId(f.getUser() != null ? f.getUser().getId() : null)
                .farmerName(f.getFarmerName())
                .fatherSpouseName(f.getFatherSpouseName())
                .dob(f.getDob())
                .gender(f.getGender())
                .mobileNumber(f.getMobileNumber())
                .alternateMobile(f.getAlternateMobile())
                .aadhaarNumber(f.getAadhaarNumber())
                .category(f.getCategory())
                .address(f.getAddress())
                .village(f.getVillage())
                .tehsil(f.getTehsil())
                .district(f.getDistrict())
                .state(f.getState())
                .pinCode(f.getPinCode())
                .farmerType(f.getFarmerType())
                .farmingType(f.getFarmingType())
                .primaryCrop(f.getPrimaryCrop())
                .secondaryCrops(f.getSecondaryCrops())
                .totalLandArea(f.getTotalLandArea())
                .irrigationAvailable(f.getIrrigationAvailable())
                .irrigationType(f.getIrrigationType())
                .soilType(f.getSoilType())
                .documentsJson(f.getDocumentsJson())
                .profileCompletionPercentage(f.getProfileCompletionPercentage() != null ? f.getProfileCompletionPercentage() : f.calculateCompletionPercentage())
                .preferredLanguage(f.getPreferredLanguage())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
