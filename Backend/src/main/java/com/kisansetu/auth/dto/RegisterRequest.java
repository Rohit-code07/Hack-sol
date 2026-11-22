package com.kisansetu.auth.dto;

import com.kisansetu.common.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required (FARMER or BANK_OFFICER)")
    private UserRole role;

    // Optional fields for automated farmer linkage if role == FARMER
    private String farmerName;
    private String mobileNumber;
    private String village;
    private String tehsil;
    private String district;
    private String state;
}
