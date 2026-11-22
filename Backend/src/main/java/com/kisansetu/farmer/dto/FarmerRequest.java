package com.kisansetu.farmer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmerRequest {

    @NotBlank(message = "Farmer name is required")
    @Size(min = 2, max = 150, message = "Farmer name must be between 2 and 150 characters")
    private String farmerName;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Mobile number must be a valid 10-digit Indian mobile number")
    private String mobileNumber;

    @NotBlank(message = "Village is required")
    private String village;

    @NotBlank(message = "Tehsil is required")
    private String tehsil;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "State is required")
    private String state;

    private String preferredLanguage;
}
