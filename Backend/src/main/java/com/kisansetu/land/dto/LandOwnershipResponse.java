package com.kisansetu.land.dto;

import com.kisansetu.common.enums.OwnershipType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandOwnershipResponse {
    private Long id;
    private Long landRecordId;
    private UUID farmerId;
    private String farmerName;
    private OwnershipType ownershipType;
    private BigDecimal ownershipPercentage;
    private LocalDate validFrom;
    private LocalDate validTo;
}
