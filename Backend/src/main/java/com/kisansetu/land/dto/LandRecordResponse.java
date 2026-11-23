package com.kisansetu.land.dto;

import com.kisansetu.common.enums.OwnershipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandRecordResponse {
    private Long id;
    private String khasraNumber;
    private String khataNumber;
    private String surveyNumber;
    private String village;
    private String tehsil;
    private String district;
    private String state;
    private BigDecimal landArea;
    private String areaUnit;
    private String ownerName;
    private String coOwnerDetails;
    private String irrigationStatus;
    private String landUsage;
    private Boolean isMortgaged;
    private Boolean isCollateral;
    private String verificationStatus;
    private String verificationRemarks;
    private LocalDateTime verifiedAt;
    private OwnershipStatus ownershipStatus;
    private String fullGeoIdentity;
    private LocalDateTime createdAt;
    private List<LandOwnershipResponse> owners;
    private List<MortgageResponse> activeMortgages;
}
