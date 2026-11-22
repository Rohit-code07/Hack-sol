package com.kisansetu.auth;

import com.kisansetu.auth.dto.AuthRequest;
import com.kisansetu.auth.dto.AuthResponse;
import com.kisansetu.auth.dto.RegisterRequest;
import com.kisansetu.auth.entity.User;
import com.kisansetu.auth.repository.UserRepository;
import com.kisansetu.auth.service.AuthService;
import com.kisansetu.common.enums.UserRole;
import com.kisansetu.common.exception.DuplicateResourceException;
import com.kisansetu.config.JwtTokenProvider;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FarmerRepository farmerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User sampleFarmerUser;
    private UUID sampleFarmerId;

    @BeforeEach
    void setUp() {
        sampleFarmerId = UUID.randomUUID();
        sampleFarmerUser = User.builder()
                .id(1L)
                .username("farmer_ramesh")
                .passwordHash("hashed_password")
                .role(UserRole.FARMER)
                .enabled(true)
                .build();
    }

    @Test
    @DisplayName("User login returns JWT token and farmer metadata")
    void testLogin_Success() {
        AuthRequest req = AuthRequest.builder()
                .username("farmer_ramesh")
                .password("password123")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mock.jwt.token");
        when(userRepository.findByUsername("farmer_ramesh")).thenReturn(Optional.of(sampleFarmerUser));

        Farmer farmer = Farmer.builder().id(sampleFarmerId).user(sampleFarmerUser).build();
        when(farmerRepository.findByUserId(1L)).thenReturn(Optional.of(farmer));

        AuthResponse res = authService.login(req);

        assertThat(res.getToken()).isEqualTo("mock.jwt.token");
        assertThat(res.getUsername()).isEqualTo("farmer_ramesh");
        assertThat(res.getRole()).isEqualTo(UserRole.FARMER);
        assertThat(res.getFarmerId()).isEqualTo(sampleFarmerId);
    }

    @Test
    @DisplayName("Registration with existing username throws DuplicateResourceException")
    void testRegister_DuplicateUsername() {
        RegisterRequest req = RegisterRequest.builder()
                .username("farmer_ramesh")
                .password("password123")
                .role(UserRole.FARMER)
                .build();

        when(userRepository.existsByUsername("farmer_ramesh")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(req));
    }

    @Test
    @DisplayName("Generate BCrypt hash for verification")
    void generatePasswordHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode("password123");
        System.out.println("BCRYPT_HASH_RESULT=" + hash);
        assertThat(encoder.matches("password123", hash)).isTrue();
    }
}
