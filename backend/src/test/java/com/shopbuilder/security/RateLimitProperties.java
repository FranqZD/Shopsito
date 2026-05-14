package com.shopbuilder.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import net.jqwik.api.*;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Property-based tests for RateLimitFilter.
 *
 * Validates: Requirements 2.1, 2.2 (security)
 */
class RateLimitProperties {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Property 18: Login rate limiting
     * For any IP address, the first 10 POST /api/auth/login requests should pass
     * (filter chain called, status 200), and the 11th request should be rejected
     * with HTTP 429 and the standard error JSON response.
     *
     * Validates: Requirements 2.1, 2.2
     */
    @Property(tries = 50)
    void rateLimitAllowsFirst10RequestsAndRejects11th(@ForAll("validIpAddresses") String ip)
            throws ServletException, IOException {
        RateLimitFilter filter = new RateLimitFilter();
        FilterChain filterChain = mock(FilterChain.class);

        // First 10 requests should pass
        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
            request.setRemoteAddr(ip);
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilterInternal(request, response, filterChain);

            assertEquals(200, response.getStatus(),
                    "Request " + (i + 1) + " from IP " + ip + " should pass");
        }

        // Verify filter chain was called 10 times
        verify(filterChain, times(10)).doFilter(any(), any());

        // 11th request should be rejected with 429
        MockHttpServletRequest blockedRequest = new MockHttpServletRequest("POST", "/api/auth/login");
        blockedRequest.setRemoteAddr(ip);
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();

        filter.doFilterInternal(blockedRequest, blockedResponse, filterChain);

        assertEquals(429, blockedResponse.getStatus(),
                "11th request from IP " + ip + " should be rejected with 429");
        assertEquals("application/json", blockedResponse.getContentType());

        // Verify error JSON shape
        JsonNode json = objectMapper.readTree(blockedResponse.getContentAsString());
        assertEquals("Too many login attempts. Please try again later.", json.get("error").asText());
        assertEquals(429, json.get("status").asInt());
        assertNotNull(json.get("timestamp").asText());
        assertDoesNotThrow(() -> java.time.Instant.parse(json.get("timestamp").asText()),
                "Timestamp should be valid ISO-8601");

        // Verify filter chain was NOT called for the 11th request (still 10 total)
        verify(filterChain, times(10)).doFilter(any(), any());
    }

    /**
     * Property 18 (independence): Different IPs should have independent rate limits.
     * Exhausting the limit for one IP should not affect another IP's ability to make requests.
     *
     * Validates: Requirements 2.1, 2.2
     */
    @Property(tries = 30)
    void differentIpsHaveIndependentRateLimits(
            @ForAll("validIpAddresses") String ip1,
            @ForAll("validIpAddresses") String ip2) throws ServletException, IOException {

        Assume.that(!ip1.equals(ip2));

        RateLimitFilter filter = new RateLimitFilter();
        FilterChain filterChain = mock(FilterChain.class);

        // Exhaust rate limit for ip1 (10 requests)
        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
            request.setRemoteAddr(ip1);
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilterInternal(request, response, filterChain);
            assertEquals(200, response.getStatus());
        }

        // Verify ip1 is now rate-limited
        MockHttpServletRequest blockedRequest = new MockHttpServletRequest("POST", "/api/auth/login");
        blockedRequest.setRemoteAddr(ip1);
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        filter.doFilterInternal(blockedRequest, blockedResponse, filterChain);
        assertEquals(429, blockedResponse.getStatus(),
                "IP1 (" + ip1 + ") should be rate-limited after 10 requests");

        // ip2 should still be able to make requests
        MockHttpServletRequest ip2Request = new MockHttpServletRequest("POST", "/api/auth/login");
        ip2Request.setRemoteAddr(ip2);
        MockHttpServletResponse ip2Response = new MockHttpServletResponse();
        filter.doFilterInternal(ip2Request, ip2Response, filterChain);

        assertEquals(200, ip2Response.getStatus(),
                "IP2 (" + ip2 + ") should not be affected by IP1's rate limit");
    }

    @Provide
    Arbitrary<String> validIpAddresses() {
        // Generate realistic IPv4 addresses
        Arbitrary<Integer> octet = Arbitraries.integers().between(1, 254);
        return Combinators.combine(octet, octet, octet, octet)
                .as((a, b, c, d) -> a + "." + b + "." + c + "." + d);
    }
}
