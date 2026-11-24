package com.kisansetu.grievance.dto;

import com.kisansetu.common.enums.GrievanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrievanceStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private GrievanceStatus status;

    private String officerRemarks;
    private String resolutionDetails;
}
