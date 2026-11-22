package com.kisansetu.land.service;

import com.kisansetu.common.enums.OwnershipType;
import com.kisansetu.common.exception.DuplicateResourceException;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.common.util.FarmerAccessValidator;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LandService {

    private final LandRecordRepository landRecordRepository;
    private final LandOwnershipRepository landOwnershipRepository;
    private final MortgageRepository mortgageRepository;
    private final FarmerRepository farmerRepository;
    private final FarmerAccessValidator farmerAccessValidator;

    @Transactional
    public LandRecordResponse createLandRecord(LandRecordRequest request) {
        var existing = landRecordRepository.findByStateAndDistrictAndTehsilAndVillageAndKhasraNumber(
                request.getState(), request.getDistrict(), request.getTehsil(), request.getVillage(), request.getKhasraNumber());
        if (existing.isPresent()) {
            throw new DuplicateResourceException(String.format("Land parcel '%s' already registered in %s, %s, %s, %s",
                    request.getKhasraNumber(), request.getVillage(), request.getTehsil(), request.getDistrict(), request.getState()));
        }

        LandRecord parcel = LandRecord.builder()
                .khasraNumber(request.getKhasraNumber())
                .village(request.getVillage())
                .tehsil(request.getTehsil())
                .district(request.getDistrict())
                .state(request.getState())
                .landArea(request.getLandArea())
                .areaUnit(request.getAreaUnit() != null ? request.getAreaUnit() : "ACRE")
                .ownershipStatus(request.getOwnershipStatus())
                .build();

        parcel = landRecordRepository.save(parcel);

        if (request.getOwnerFarmerId() != null) {
            Farmer farmer = farmerRepository.findById(request.getOwnerFarmerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", request.getOwnerFarmerId()));

            BigDecimal pct = request.getOwnershipPercentage() != null ? request.getOwnershipPercentage() : new BigDecimal("100.00");
            LandOwnership ownership = LandOwnership.builder()
                    .landRecord(parcel)
                    .farmer(farmer)
                    .ownershipType(OwnershipType.INDIVIDUAL)
                    .ownershipPercentage(pct)
                    .validFrom(LocalDate.now())
                    .build();
            landOwnershipRepository.save(ownership);
        }

        return getLandRecordById(parcel.getId());
    }

    @Transactional(readOnly = true)
    public LandRecordResponse getLandRecordById(Long id) {
        LandRecord lr = landRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LandRecord", "id", id));

        List<LandOwnershipResponse> owners = getOwnership(id);
        List<MortgageResponse> mortgages = getMortgages(id);

        return LandRecordResponse.builder()
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
                .owners(owners)
                .activeMortgages(mortgages)
                .build();
    }

    @Transactional(readOnly = true)
    public List<LandRecordResponse> search(String state, String district, String tehsil, String village, String khasraNumber) {
        return landRecordRepository.searchParcels(state, district, tehsil, village, khasraNumber).stream()
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
    public List<LandRecordResponse> getByFarmer(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
        return landRecordRepository.findParcelsByFarmerId(farmerId).stream()
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
    public List<LandOwnershipResponse> getOwnership(Long landRecordId) {
        return landOwnershipRepository.findByLandRecordId(landRecordId).stream()
                .map(lo -> LandOwnershipResponse.builder()
                        .id(lo.getId())
                        .landRecordId(lo.getLandRecord().getId())
                        .farmerId(lo.getFarmer().getId())
                        .farmerName(lo.getFarmer().getFarmerName())
                        .ownershipType(lo.getOwnershipType())
                        .ownershipPercentage(lo.getOwnershipPercentage())
                        .validFrom(lo.getValidFrom())
                        .validTo(lo.getValidTo())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MortgageResponse> getMortgages(Long landRecordId) {
        return mortgageRepository.findByLandRecordId(landRecordId).stream()
                .map(m -> MortgageResponse.builder()
                        .id(m.getId())
                        .landRecordId(m.getLandRecord().getId())
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
