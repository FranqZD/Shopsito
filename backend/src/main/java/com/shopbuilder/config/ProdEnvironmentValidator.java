package com.shopbuilder.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Validates that all required environment variables are set when running
 * with the "prod" profile. Fails fast at startup with a clear error message
 * if any required variable is missing.
 */
@Component
@Profile("prod")
public class ProdEnvironmentValidator {

    private static final Logger log = LoggerFactory.getLogger(ProdEnvironmentValidator.class);

    private static final List<String> REQUIRED_ENV_VARS = List.of(
            "DB_URL",
            "DB_USERNAME",
            "DB_PASSWORD",
            "JWT_SECRET",
            "APP_CORS_ALLOWED_ORIGIN",
            "STORAGE_PROVIDER"
    );

    private final Environment environment;

    public ProdEnvironmentValidator(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validateRequiredEnvironmentVariables() {
        List<String> missingVars = new ArrayList<>();

        for (String varName : REQUIRED_ENV_VARS) {
            String value = environment.getProperty(varName);
            if (value == null || value.isBlank()) {
                // Also check as system env var directly
                String envValue = System.getenv(varName);
                if (envValue == null || envValue.isBlank()) {
                    missingVars.add(varName);
                }
            }
        }

        if (!missingVars.isEmpty()) {
            String errorMessage = String.format(
                    "Application startup failed: The following required environment variables are not set: %s. " +
                    "Please set these variables before starting the application in production mode.",
                    String.join(", ", missingVars)
            );
            log.error(errorMessage);
            throw new IllegalStateException(errorMessage);
        }

        log.info("All required environment variables are configured for production.");
    }
}
