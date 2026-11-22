package com.kisansetu.farmer.service;

import com.kisansetu.auth.entity.User;
import com.kisansetu.auth.repository.UserRepository;
import com.kisansetu.common.enums.UserRole;
import com.kisansetu.common.exception.AccessDeniedException;
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
                .mobileNumber(request.getMobileNumber())
                .village(request.getVillage())
                .tehsil(request.getTehsil())
                .district(request.getDistrict())
                .state(request.getState())
                .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "hi")
                .createdAt(LocalDateTime.now())
                .build();

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

        if (!farmer.getMobileNumber().equals(request.getMobileNumber())) {
            var existing = farmerRepository.findByMobileNumber(request.getMobileNumber());
            if (existing.isPresent() && !existing.get().getId().equals(farmerId)) {
                throw new DuplicateResourceException("Mobile number already in use: " + request.getMobileNumber());
            }
            farmer.setMobileNumber(request.getMobileNumber());
        }

        farmer.setFarmerName(request.getFarmerName());
        farmer.setVillage(request.getVillage());
        farmer.setTehsil(request.getTehsil());
        farmer.setDistrict(request.getDistrict());
        farmer.setState(request.getState());
        if (request.getPreferredLanguage() != null) {
            farmer.setPreferredLanguage(request.getPreferredLanguage());
        }

        farmer = farmerRepository.save(farmer);
        return mapToResponse(farmer);
    }

    @Transactional(readOnly = true)
    public FarmerDashboardResponse getDashboard(UUID farmerId) {
        validateAccess(farmerId);
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", farmerId));

        List<LandRecord> parcels = landRecordRepository.findParcelsByFarmerId(farmerId);
        BigDecimal totalArea = parcels.stream()
                .map(LandRecord::getLandArea)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<LoanRecord> loans = loanRecordRepository.findByFarmerId(farmerId);
        List<LoanRecord> activeLoans = loans.stream()
                .filter(l -> l.getRepaymentStatus() == com.kisansetu.common.enums.RepaymentStatus.ACTIVE)
                .toList();

        BigDecimal totalLoanAmount = activeLoans.stream()
                .map(LoanRecord::getDisbursedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Discrepancy> discrepancies = discrepancyRepository.findByFarmerId(farmerId);
        BigDecimal totalDiscrepancyDiff = discrepancies.stream()
                .map(d -> d.getDifferenceAmount() != null ? d.getDifferenceAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Grievance> grievances = grievanceRepository.findByFarmerId(farmerId);

        return FarmerDashboardResponse.builder()
                .profile(mapToResponse(farmer))
                .totalLandParcels(parcels.size())
                .totalLandAreaInAcres(totalArea)
                .activeLoansCount(activeLoans.size())
                .totalDisbursedLoanAmount(totalLoanAmount)
                .detectedDiscrepanciesCount(discrepancies.size())
                .totalDiscrepancyDifferenceAmount(totalDiscrepancyDiff)
                .submittedGrievancesCount(grievances.size())
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
                        .village(lr.getVillage())
                        .tehsil(lr.getTehsil())
                        .district(lr.getDistrict())
                        .state(lr.getState())
                        .landArea(lr.getLandArea())
                        .areaUnit(lr.getAreaUnit())
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
                        .interestRate(l.getInterestRate())
                        .disbursementDate(l.getDisbursementDate())
                        .maturityDate(l.getMaturityDate())
                        .repaymentStatus(l.getRepaymentStatus())
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
                        .subject(g.getSubject())
                        .grievanceContent(g.getGrievanceContent())
                        .language(g.getLanguage())
                        .evidenceChecklist(g.getEvidenceChecklist())
                        .grievanceStatus(g.getGrievanceStatus())
                        .recordedDifferenceAmount(g.getDiscrepancy() != null ? g.getDiscrepancy().getDifferenceAmount() : null)
                        .createdAt(g.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public void validateAccess(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
    }

    private FarmerResponse mapToResponse(Farmer f) {
        return FarmerResponse.builder()
                .id(f.getId())
                .userId(f.getUser() != null ? f.getUser().getId() : null)
                .farmerName(f.getFarmerName())
                .mobileNumber(f.getMobileNumber())
                .village(f.getVillage())
                .tehsil(f.getTehsil())
                .district(f.getDistrict())
                .state(f.getState())
                .preferredLanguage(f.getPreferredLanguage())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
