package com.kisansetu.farmer;

import com.kisansetu.auth.repository.UserRepository;
import com.kisansetu.common.enums.UserRole;
import com.kisansetu.common.exception.AccessDeniedException;
import com.kisansetu.common.exception.DuplicateResourceException;
import com.kisansetu.common.util.FarmerAccessValidator;
import com.kisansetu.discrepancy.repository.DiscrepancyRepository;
import com.kisansetu.discrepancy.service.DiscrepancyService;
import com.kisansetu.farmer.dto.FarmerRequest;
import com.kisansetu.farmer.dto.FarmerResponse;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.farmer.service.FarmerService;
import com.kisansetu.grievance.repository.GrievanceRepository;
import com.kisansetu.land.repository.LandRecordRepository;
import com.kisansetu.loan.repository.LoanRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FarmerServiceTest {

    @Mock
    private FarmerRepository farmerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LandRecordRepository landRecordRepository;

    @Mock
    private LoanRecordRepository loanRecordRepository;

    @Mock
    private DiscrepancyRepository discrepancyRepository;

    @Mock
    private GrievanceRepository grievanceRepository;

    @Mock
    private DiscrepancyService discrepancyService;

    @Mock
    private FarmerAccessValidator farmerAccessValidator;

    @InjectMocks
    private FarmerService farmerService;

    private UUID farmer1Id;
    private UUID farmer2Id;

    @BeforeEach
    void setUp() {
        farmer1Id = UUID.randomUUID();
        farmer2Id = UUID.randomUUID();
    }

    @Test
    @DisplayName("Farmer registration succeeds with valid information")
    void testRegisterFarmer_Success() {
        FarmerRequest req = FarmerRequest.builder()
                .farmerName("Ramesh Patel")
                .mobileNumber("9827100001")
                .village("Arang")
                .tehsil("Arang")
                .district("Raipur")
                .state("Chhattisgarh")
                .preferredLanguage("hi")
                .build();

        when(farmerRepository.findByMobileNumber("9827100001")).thenReturn(Optional.empty());

        Farmer saved = Farmer.builder()
                .id(farmer1Id)
                .farmerName(req.getFarmerName())
                .mobileNumber(req.getMobileNumber())
                .village(req.getVillage())
                .tehsil(req.getTehsil())
                .district(req.getDistrict())
                .state(req.getState())
                .preferredLanguage("hi")
                .build();

        when(farmerRepository.save(any(Farmer.class))).thenReturn(saved);

        FarmerResponse res = farmerService.registerFarmer(req);

        assertThat(res.getId()).isEqualTo(farmer1Id);
        assertThat(res.getFarmerName()).isEqualTo("Ramesh Patel");
    }

    @Test
    @DisplayName("Registration fails when mobile number is already registered")
    void testRegisterFarmer_DuplicateMobile_ThrowsException() {
        FarmerRequest req = FarmerRequest.builder()
                .farmerName("Ramesh Patel")
                .mobileNumber("9827100001")
                .village("Arang")
                .tehsil("Arang")
                .district("Raipur")
                .state("Chhattisgarh")
                .build();

        when(farmerRepository.findByMobileNumber("9827100001"))
                .thenReturn(Optional.of(Farmer.builder().id(farmer1Id).build()));

        assertThrows(DuplicateResourceException.class, () -> farmerService.registerFarmer(req));
    }

    @Test
    @DisplayName("Farmer is blocked when attempting to access another farmer's profile")
    void testUnauthorizedAccess_ToAnotherFarmerProfile() {
        org.mockito.Mockito.doThrow(new AccessDeniedException("Access denied"))
                .when(farmerAccessValidator).validateAccess(farmer2Id);

        assertThrows(AccessDeniedException.class, () -> farmerService.getFarmerProfile(farmer2Id));
    }
}
