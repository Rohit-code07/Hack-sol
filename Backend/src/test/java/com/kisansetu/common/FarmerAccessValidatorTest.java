package com.kisansetu.common;

import com.kisansetu.common.enums.UserRole;
import com.kisansetu.common.exception.AccessDeniedException;
import com.kisansetu.common.util.FarmerAccessValidator;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import org.junit.jupiter.api.AfterEach;
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

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FarmerAccessValidatorTest {

    @Mock
    private FarmerRepository farmerRepository;

    @InjectMocks
    private FarmerAccessValidator validator;

    private UUID farmer1Id;
    private UUID farmer2Id;

    @BeforeEach
    void setUp() {
        farmer1Id = UUID.randomUUID();
        farmer2Id = UUID.randomUUID();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Bank officer can access any farmer record")
    void testBankOfficerAccess_Allowed() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "bank_officer_sharma",
                        "password",
                        List.of(new SimpleGrantedAuthority("ROLE_BANK_OFFICER"))
                )
        );

        assertDoesNotThrow(() -> validator.validateAccess(farmer1Id));
    }

    @Test
    @DisplayName("Farmer can access their own record")
    void testFarmerAccess_OwnRecord_Allowed() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "farmer_ramesh",
                        "password",
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                )
        );

        Farmer farmer1 = Farmer.builder().id(farmer1Id).build();
        when(farmerRepository.findByUserUsername("farmer_ramesh")).thenReturn(Optional.of(farmer1));

        assertDoesNotThrow(() -> validator.validateAccess(farmer1Id));
    }

    @Test
    @DisplayName("Farmer is forbidden from accessing another farmer's record")
    void testFarmerAccess_OtherRecord_ThrowsAccessDenied() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "farmer_ramesh",
                        "password",
                        List.of(new SimpleGrantedAuthority("ROLE_FARMER"))
                )
        );

        Farmer farmer1 = Farmer.builder().id(farmer1Id).build();
        when(farmerRepository.findByUserUsername("farmer_ramesh")).thenReturn(Optional.of(farmer1));

        assertThrows(AccessDeniedException.class, () -> validator.validateAccess(farmer2Id));
    }

    @Test
    @DisplayName("Unlinked or unauthenticated user throws AccessDeniedException")
    void testUnauthenticated_ThrowsAccessDenied() {
        assertThrows(AccessDeniedException.class, () -> validator.validateAccess(farmer1Id));
    }
}
