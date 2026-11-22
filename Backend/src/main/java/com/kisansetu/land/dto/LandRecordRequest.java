package com.kisansetu.land.dto;

import com.kisansetu.common.enums.OwnershipStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandRecordRequest {

    @NotBlank(message = "Khasra number is required")
    private String khasraNumber;

    @NotBlank(message = "Village is required")
    private String village;

    @NotBlank(message = "Tehsil is required")
    private String tehsil;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "State is required")
    private String state;

    @NotNull(message = "Land area is required")
    @DecimalMin(value = "0.01", message = "Land area must be greater than zero")
    private BigDecimal landArea;

    @Builder.Default
    private String areaUnit = "ACRE";

    @Builder.Default
    private OwnershipStatus ownershipStatus = OwnershipStatus.CLEAR;

    // Optional initial farmer owner linkage
    private UUID ownerFarmerId;
    private BigDecimal ownershipPercentage;
}
