package com.kisansetu.land.service;

import com.kisansetu.common.enums.DiscrepancyCategory;
import com.kisansetu.common.enums.DiscrepancySeverity;
import com.kisansetu.common.enums.OwnershipStatus;
import com.kisansetu.common.enums.OwnershipType;
import com.kisansetu.common.enums.VerificationStatus;
import com.kisansetu.common.exception.DuplicateResourceException;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.common.util.FarmerAccessValidator;
import com.kisansetu.common.util.SecurityUtils;
import com.kisansetu.discrepancy.entity.Discrepancy;
import com.kisansetu.discrepancy.repository.DiscrepancyRepository;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.land.dto.LandOwnershipResponse;
import com.kisansetu.land.dto.LandRecordRequest;
import com.kisansetu.land.dto.LandRecordResponse;
import com.kisansetu.land.dto.MortgageResponse;
import com.kisansetu.land.entity.LandOwnership;
import com.kisansetu.land.entity.LandRecord;
import com.kisansetu.land.entity.Mortgage;
import com.kisansetu.land.repository.LandOwnershipRepository;
import com.kisansetu.land.repository.LandRecordRepository;
import com.kisansetu.land.repository.MortgageRepository;
import com.kisansetu.verification.entity.SyntheticLandRegistry;
import com.kisansetu.verification.repository.SyntheticLandRegistryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LandService {

    private final LandRecordRepository landRecordRepository;
    private final LandOwnershipRepository landOwnershipRepository;
    private final MortgageRepository mortgageRepository;
    private final FarmerRepository farmerRepository;
    private final SyntheticLandRegistryRepository syntheticLandRegistryRepository;
    private final DiscrepancyRepository discrepancyRepository;
    private final FarmerAccessValidator farmerAccessValidator;

    @Transactional
    public LandRecordResponse createLandRecord(LandRecordRequest request) {
        Farmer ownerFarmer = null;
        UUID targetFarmerId = request.getOwnerFarmerId();
        if (targetFarmerId != null) {
            ownerFarmer = farmerRepository.findById(targetFarmerId).orElse(null);
        }

        // Auto-resolve to authenticated farmer if owner not specified or found
        if (ownerFarmer == null) {
            String currentUsername = SecurityUtils.getCurrentUsername();
            if (currentUsername != null) {
                ownerFarmer = farmerRepository.findByUserUsername(currentUsername).orElse(null);
            }
        }

        var existing = landRecordRepository.findByStateAndDistrictAndTehsilAndVillageAndKhasraNumber(
                request.getState(), request.getDistrict(), request.getTehsil(), request.getVillage(), request.getKhasraNumber());
        if (existing.isPresent()) {
            LandRecord existingRecord = existing.get();
            if (ownerFarmer != null) {
                final UUID finalFarmerId = ownerFarmer.getId();
                boolean alreadyLinked = landOwnershipRepository.findByLandRecordId(existingRecord.getId()).stream()
                        .anyMatch(lo -> lo.getFarmer().getId().equals(finalFarmerId));
                if (!alreadyLinked) {
                    BigDecimal pct = request.getOwnershipPercentage() != null ? request.getOwnershipPercentage() : new BigDecimal("100.00");
                    LandOwnership ownership = LandOwnership.builder()
                            .landRecord(existingRecord)
                            .farmer(ownerFarmer)
                            .ownershipType(OwnershipType.INDIVIDUAL)
                            .ownershipPercentage(pct)
                            .validFrom(LocalDate.now())
                            .build();
                    landOwnershipRepository.save(ownership);
                    return mapToResponse(existingRecord);
                }
            }
            throw new DuplicateResourceException(String.format("Land parcel '%s' already registered in %s, %s, %s, %s",
                    request.getKhasraNumber(), request.getVillage(), request.getTehsil(), request.getDistrict(), request.getState()));
        }

        String initialStatus = "PENDING";
        String remarks = "Submitted for verification against Demo Registry";

        // Automated cross-verification against Synthetic Land Registry
        Optional<SyntheticLandRegistry> synthOpt = syntheticLandRegistryRepository
                .findByStateAndDistrictAndTehsilAndVillageAndKhasraNumber(
                        request.getState(), request.getDistrict(), request.getTehsil(), request.getVillage(), request.getKhasraNumber());

        if (synthOpt.isPresent()) {
            SyntheticLandRegistry synth = synthOpt.get();
            boolean areaMatch = synth.getLandArea().compareTo(request.getLandArea()) == 0;
            String farmerName = ownerFarmer != null ? ownerFarmer.getFarmerName() : (request.getOwnerName() != null ? request.getOwnerName() : "");
            boolean nameMatch = synth.getRegisteredOwnerName().equalsIgnoreCase(farmerName) ||
                                (request.getOwnerName() != null && synth.getRegisteredOwnerName().equalsIgnoreCase(request.getOwnerName()));

            if (nameMatch && areaMatch) {
                initialStatus = "VERIFIED";
                remarks = "Verified against Demo Registry. All titles and boundaries match.";
            } else if (!nameMatch) {
                initialStatus = "MISMATCH";
                remarks = String.format("Owner name mismatch: Declared '%s' vs Demo Registry '%s'", farmerName, synth.getRegisteredOwnerName());

                if (ownerFarmer != null) {
                    Discrepancy disc = Discrepancy.builder()
                            .farmer(ownerFarmer)
                            .category(DiscrepancyCategory.LAND_RECORD_MISMATCH)
                            .referenceId(request.getKhasraNumber())
                            .severity(DiscrepancySeverity.HIGH)
                            .description(remarks)
                            .verificationStatus(VerificationStatus.DETECTED)
                            .build();
                    discrepancyRepository.save(disc);
                }
            } else {
                initialStatus = "PARTIAL_MATCH";
                remarks = String.format("Area mismatch: Declared %s %s vs Demo Registry %s %s",
                        request.getLandArea(), request.getAreaUnit(), synth.getLandArea(), synth.getAreaUnit());
            }

            if (synth.getIsMortgaged() && !Boolean.TRUE.equals(request.getIsMortgaged())) {
                initialStatus = "MISMATCH";
                remarks += " | Undisclosed mortgage found in Demo Registry: " + synth.getMortgagedBankName();
            }
        } else {
            remarks = "Registry Record Not Found in Demo Registry. Physical verification required.";
        }

        LandRecord parcel = LandRecord.builder()
                .khasraNumber(request.getKhasraNumber())
                .khataNumber(request.getKhataNumber())
                .surveyNumber(request.getSurveyNumber())
                .village(request.getVillage())
                .tehsil(request.getTehsil())
                .district(request.getDistrict())
                .state(request.getState())
                .landArea(request.getLandArea())
                .areaUnit(request.getAreaUnit() != null ? request.getAreaUnit() : "ACRE")
                .ownerName(request.getOwnerName() != null ? request.getOwnerName() : (ownerFarmer != null ? ownerFarmer.getFarmerName() : null))
                .coOwnerDetails(request.getCoOwnerDetails())
                .irrigationStatus(request.getIrrigationStatus() != null ? request.getIrrigationStatus() : "UNIRRIGATED")
                .landUsage(request.getLandUsage() != null ? request.getLandUsage() : "AGRICULTURAL")
                .isMortgaged(request.getIsMortgaged() != null ? request.getIsMortgaged() : false)
                .isCollateral(request.getIsCollateral() != null ? request.getIsCollateral() : false)
                .verificationStatus(initialStatus)
                .verificationRemarks(remarks)
                .ownershipStatus(request.getOwnershipStatus())
                .build();

        parcel = landRecordRepository.save(parcel);

        if (ownerFarmer != null) {
            BigDecimal pct = request.getOwnershipPercentage() != null ? request.getOwnershipPercentage() : new BigDecimal("100.00");
            LandOwnership ownership = LandOwnership.builder()
                    .landRecord(parcel)
                    .farmer(ownerFarmer)
                    .ownershipType(OwnershipType.INDIVIDUAL)
                    .ownershipPercentage(pct)
                    .validFrom(LocalDate.now())
                    .build();
            landOwnershipRepository.save(ownership);
        }

        return mapToResponse(parcel);
    }

    @Transactional
    public LandRecordResponse updateLandRecord(Long id, LandRecordRequest request) {
        LandRecord parcel = landRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LandRecord", "id", id));

        if (request.getLandArea() != null) parcel.setLandArea(request.getLandArea());
        if (request.getKhataNumber() != null) parcel.setKhataNumber(request.getKhataNumber());
        if (request.getSurveyNumber() != null) parcel.setSurveyNumber(request.getSurveyNumber());
        if (request.getOwnerName() != null) parcel.setOwnerName(request.getOwnerName());
        if (request.getCoOwnerDetails() != null) parcel.setCoOwnerDetails(request.getCoOwnerDetails());
        if (request.getIrrigationStatus() != null) parcel.setIrrigationStatus(request.getIrrigationStatus());
        if (request.getLandUsage() != null) parcel.setLandUsage(request.getLandUsage());
        if (request.getIsMortgaged() != null) parcel.setIsMortgaged(request.getIsMortgaged());
        if (request.getIsCollateral() != null) parcel.setIsCollateral(request.getIsCollateral());

        parcel = landRecordRepository.save(parcel);
        return mapToResponse(parcel);
    }

    @Transactional(readOnly = true)
    public LandRecordResponse getLandRecordById(Long id) {
        LandRecord lr = landRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LandRecord", "id", id));
        return mapToResponse(lr);
    }

    @Transactional(readOnly = true)
    public List<LandRecordResponse> search(String state, String district, String tehsil, String village, String khasraNumber) {
        return landRecordRepository.searchParcels(state, district, tehsil, village, khasraNumber).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LandRecordResponse> getByFarmer(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
        return landRecordRepository.findParcelsByFarmerId(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private LandRecordResponse mapToResponse(LandRecord lr) {
        List<LandOwnershipResponse> owners = getOwnership(lr.getId());
        List<MortgageResponse> mortgages = getMortgages(lr.getId());

        return LandRecordResponse.builder()
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
                .verifiedAt(lr.getVerifiedAt())
                .ownershipStatus(lr.getOwnershipStatus())
                .fullGeoIdentity(lr.getFullGeoIdentity())
                .createdAt(lr.getCreatedAt())
                .owners(owners)
                .activeMortgages(mortgages)
                .build();
    }

    public List<LandOwnershipResponse> getOwnership(Long landRecordId) {
        return landOwnershipRepository.findByLandRecordId(landRecordId).stream()
                .map(lo -> LandOwnershipResponse.builder()
                        .id(lo.getId())
                        .farmerId(lo.getFarmer().getId())
                        .farmerName(lo.getFarmer().getFarmerName())
                        .ownershipType(lo.getOwnershipType())
                        .ownershipPercentage(lo.getOwnershipPercentage())
                        .validFrom(lo.getValidFrom())
                        .validTo(lo.getValidTo())
                        .build())
                .collect(Collectors.toList());
    }

    private List<MortgageResponse> getMortgages(Long landRecordId) {
        return mortgageRepository.findByLandRecordId(landRecordId).stream()
                .map(m -> MortgageResponse.builder()
                        .id(m.getId())
                        .bankId(m.getBank().getId())
                        .bankName(m.getBank().getBankName())
                        .branchName(m.getBank().getBranchName())
                        .mortgageReference(m.getMortgageReference())
                        .mortgageAmount(m.getMortgageAmount())
                        .mortgageStatus(m.getMortgageStatus())
                        .startDate(m.getStartDate())
                        .releaseDate(m.getReleaseDate())
                        .build())
                .collect(Collectors.toList());
    }
}
