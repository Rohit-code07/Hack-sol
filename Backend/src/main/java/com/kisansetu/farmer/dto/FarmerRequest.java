package com.kisansetu.farmer.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmerRequest {

    @JsonAlias({"name"})
    @NotBlank(message = "Farmer name is required")
    @Size(min = 2, max = 150, message = "Farmer name must be between 2 and 150 characters")
    private String farmerName;

    private String fatherSpouseName;
    private LocalDate dob;
    private String gender;

    @JsonAlias({"mobile", "phone"})
    private String mobileNumber;

    private String alternateMobile;
    private String aadhaarNumber;
    private String category;
    private String address;

    @NotBlank(message = "Village is required")
    private String village;

    @NotBlank(message = "Tehsil is required")
    private String tehsil;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "State is required")
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
    private String preferredLanguage;
}
