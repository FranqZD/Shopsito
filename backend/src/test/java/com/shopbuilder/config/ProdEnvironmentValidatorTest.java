package com.shopbuilder.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProdEnvironmentValidatorTest {

    @Test
    void shouldFailWhenRequiredEnvVarsAreMissing() {
        Environment environment = mock(Environment.class);
        // All variables return null (missing)
        when(environment.getProperty("DB_URL")).thenReturn(null);
        when(environment.getProperty("DB_USERNAME")).thenReturn(null);
        when(environment.getProperty("DB_PASSWORD")).thenReturn(null);
        when(environment.getProperty("JWT_SECRET")).thenReturn(null);
        when(environment.getProperty("APP_CORS_ALLOWED_ORIGIN")).thenReturn(null);
        when(environment.getProperty("STORAGE_PROVIDER")).thenReturn(null);

        ProdEnvironmentValidator validator = new ProdEnvironmentValidator(environment);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                validator::validateRequiredEnvironmentVariables
        );

        assertTrue(exception.getMessage().contains("DB_URL"));
        assertTrue(exception.getMessage().contains("DB_USERNAME"));
        assertTrue(exception.getMessage().contains("DB_PASSWORD"));
        assertTrue(exception.getMessage().contains("JWT_SECRET"));
        assertTrue(exception.getMessage().contains("APP_CORS_ALLOWED_ORIGIN"));
        assertTrue(exception.getMessage().contains("STORAGE_PROVIDER"));
    }

    @Test
    void shouldFailWhenSomeEnvVarsAreBlank() {
        Environment environment = mock(Environment.class);
        when(environment.getProperty("DB_URL")).thenReturn("jdbc:postgresql://localhost/shop");
        when(environment.getProperty("DB_USERNAME")).thenReturn("user");
        when(environment.getProperty("DB_PASSWORD")).thenReturn("  "); // blank
        when(environment.getProperty("JWT_SECRET")).thenReturn("secret");
        when(environment.getProperty("APP_CORS_ALLOWED_ORIGIN")).thenReturn("https://example.com");
        when(environment.getProperty("STORAGE_PROVIDER")).thenReturn("cloudinary");

        ProdEnvironmentValidator validator = new ProdEnvironmentValidator(environment);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                validator::validateRequiredEnvironmentVariables
        );

        assertTrue(exception.getMessage().contains("DB_PASSWORD"));
    }

    @Test
    void shouldPassWhenAllEnvVarsAreSet() {
        Environment environment = mock(Environment.class);
        when(environment.getProperty("DB_URL")).thenReturn("jdbc:postgresql://localhost/shop");
        when(environment.getProperty("DB_USERNAME")).thenReturn("user");
        when(environment.getProperty("DB_PASSWORD")).thenReturn("password");
        when(environment.getProperty("JWT_SECRET")).thenReturn("c2VjcmV0");
        when(environment.getProperty("APP_CORS_ALLOWED_ORIGIN")).thenReturn("https://example.com");
        when(environment.getProperty("STORAGE_PROVIDER")).thenReturn("cloudinary");

        ProdEnvironmentValidator validator = new ProdEnvironmentValidator(environment);

        assertDoesNotThrow(validator::validateRequiredEnvironmentVariables);
    }
}
