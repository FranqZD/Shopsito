package com.shopbuilder.storage;

import com.shopbuilder.exception.UnsupportedMediaTypeException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Local filesystem storage implementation for the dev profile.
 * Stores uploaded files in a configurable directory and serves them via /uploads/ path.
 */
@Service
@Profile("dev")
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Value("${app.storage.upload-dir}")
    private String uploadDir;

    @Value("${app.storage.base-url}")
    private String baseUrl;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Path.of(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created upload directory: {}", uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String filename = UUID.randomUUID() + "_" + sanitizeFilename(originalFilename, extension);

        try {
            Path target = Path.of(uploadDir).resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            log.debug("Stored file: {}", filename);
            return baseUrl + "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + filename, e);
        }
    }

    @Override
    public void delete(String filename) {
        try {
            Path target = Path.of(uploadDir).resolve(filename);
            if (Files.deleteIfExists(target)) {
                log.debug("Deleted file: {}", filename);
            }
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", filename, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new UnsupportedMediaTypeException("File is empty or not provided");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new UnsupportedMediaTypeException(
                    "Unsupported file type: " + contentType + ". Allowed types: JPEG, PNG, WebP");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileSizeExceededException(
                    "File size " + file.getSize() + " bytes exceeds maximum allowed size of 5MB");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private String sanitizeFilename(String originalFilename, String extension) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "upload" + extension;
        }
        // Remove path separators and keep only the filename
        String name = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        return name;
    }
}
