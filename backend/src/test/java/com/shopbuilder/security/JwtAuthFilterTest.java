package com.shopbuilder.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.impl.DefaultClaims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private FilterChain filterChain;

    private JwtAuthFilter jwtAuthFilter;

    @BeforeEach
    void setUp() {
        jwtAuthFilter = new JwtAuthFilter(jwtService);
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldContinueFilterChainWhenNoAuthorizationHeader() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/products");
        MockHttpServletResponse response = new MockHttpServletResponse();

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void shouldContinueFilterChainWhenAuthorizationHeaderDoesNotStartWithBearer() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/products");
        request.addHeader("Authorization", "Basic sometoken");
        MockHttpServletResponse response = new MockHttpServletResponse();

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void shouldSetSecurityContextWhenTokenIsValid() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/products");
        request.addHeader("Authorization", "Bearer valid.jwt.token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        Claims claims = new DefaultClaims(Map.of(
                "sub", "seller@test.com",
                "role", "SELLER"
        ));

        when(jwtService.isTokenValid("valid.jwt.token")).thenReturn(true);
        when(jwtService.extractClaims("valid.jwt.token")).thenReturn(claims);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isEqualTo("seller@test.com");
        assertThat(auth.getCredentials()).isNull();
        assertThat(auth.getAuthorities()).hasSize(1);
        assertThat(auth.getAuthorities().iterator().next().getAuthority()).isEqualTo("ROLE_SELLER");
    }

    @Test
    void shouldNotSetSecurityContextWhenTokenIsInvalid() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/products");
        request.addHeader("Authorization", "Bearer invalid.jwt.token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtService.isTokenValid("invalid.jwt.token")).thenReturn(false);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void shouldNotFilterPublicAuthEndpoints() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/auth/login");
        assertThat(jwtAuthFilter.shouldNotFilter(request)).isTrue();

        request.setRequestURI("/api/auth/register");
        assertThat(jwtAuthFilter.shouldNotFilter(request)).isTrue();
    }

    @Test
    void shouldNotFilterUploadsEndpoints() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/uploads/image.png");
        assertThat(jwtAuthFilter.shouldNotFilter(request)).isTrue();
    }

    @Test
    void shouldNotFilterH2ConsoleEndpoints() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/h2-console/login.do");
        assertThat(jwtAuthFilter.shouldNotFilter(request)).isTrue();
    }

    @Test
    void shouldFilterProtectedEndpoints() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/products");
        assertThat(jwtAuthFilter.shouldNotFilter(request)).isFalse();

        request.setRequestURI("/api/categories");
        assertThat(jwtAuthFilter.shouldNotFilter(request)).isFalse();
    }
}
