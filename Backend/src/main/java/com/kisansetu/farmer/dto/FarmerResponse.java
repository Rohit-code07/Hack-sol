package com.kisansetu.farmer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String mobileNumber;
    private String village;
    private String tehsil;
    private String district;
    private String state;
    private String preferredLanguage;
    private LocalDateTime createdAt;
}
