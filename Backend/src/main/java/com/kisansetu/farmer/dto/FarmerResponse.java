package com.kisansetu.farmer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmerResponse {
    private UUID id;
    private Long userId;
    private String farmerName;

    @JsonProperty("name")
    public String getName() {
        return farmerName;
    }

    private String fatherSpouseName;
    private LocalDate dob;
    private String gender;
    private String mobileNumber;

    @JsonProperty("mobile")
    public String getMobile() {
        return mobileNumber;
    }

    private String alternateMobile;
    private String aadhaarNumber; // Masked e.g. XXXX-XXXX-1234
    private String category;
    private String address;
    private String village;
    private String tehsil;
    private String district;
    private String state;
    private String pinCode;
    private String farmerType;
    private String farmingType;
    private String primaryCrop;
    private String secondaryCrops;
    private BigDecimal totalLandArea;
    private Boolean irrigationAvailable;
    private String irrigationType;
    private String soilType;
    private String documentsJson;
    private Integer profileCompletionPercentage;
    private String preferredLanguage;
    private LocalDateTime createdAt;
}
