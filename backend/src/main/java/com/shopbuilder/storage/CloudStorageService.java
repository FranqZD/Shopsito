package com.shopbuilder.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.shopbuilder.exception.UnsupportedMediaTypeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

/**
 * Cloudinary-backed storage implementation for the prod profile.
 * Uploads files to Cloudinary and returns the secure public URL.
 * Credentials are read from the CLOUDINARY_URL environment variable.
 */
@Service
@Profile("prod")
public class CloudStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(CloudStorageService.class);

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    private final Cloudinary cloudinary;

    public CloudStorageService(@Value("${app.storage.cloudinary-url}") String cloudinaryUrl) {
        this.cloudinary = new Cloudinary(cloudinaryUrl);
    }

    @Override
    public String store(MultipartFile file) {
        validateFile(file);

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.emptyMap()
            );
            String secureUrl = (String) result.get("secure_url");
            log.debug("Uploaded file to Cloudinary: {}", secureUrl);
            return secureUrl;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Cloudinary", e);
        }
    }

    @Override
    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.debug("Deleted Cloudinary asset: {}", publicId);
        } catch (IOException e) {
            log.warn("Failed to delete Cloudinary asset: {}", publicId, e);
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
}
