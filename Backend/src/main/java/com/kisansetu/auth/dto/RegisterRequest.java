package com.kisansetu.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.kisansetu.common.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @JsonAlias({"user", "login"})
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Builder.Default
    private UserRole role = UserRole.FARMER;

    // Optional fields for automated farmer linkage if role == FARMER
    @JsonAlias({"name"})
    private String farmerName;
    private String fatherSpouseName;
    private java.time.LocalDate dob;
    private String gender;
    @JsonAlias({"mobile", "phone", "contactNumber"})
    private String mobileNumber;
    private String alternateMobile;
    private String aadhaarNumber;
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
    private java.math.BigDecimal totalLandArea;
    private Boolean irrigationAvailable;
    private String irrigationType;
    private String soilType;
    private String documentsJson;
    private String preferredLanguage;
}
