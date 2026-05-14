package com.shopbuilder.storage;

import com.shopbuilder.exception.UnsupportedMediaTypeException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class LocalStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalStorageService storageService;

    @BeforeEach
    void setUp() throws Exception {
        storageService = new LocalStorageService();
        setField(storageService, "uploadDir", tempDir.toString());
        setField(storageService, "baseUrl", "http://localhost:8080");
    }

    @Test
    void store_validJpegFile_returnsUrlWithUuidPrefix() {
        MockMultipartFile file = new MockMultipartFile(
                "image", "photo.jpg", "image/jpeg", new byte[1024]);

        String url = storageService.store(file);

        assertTrue(url.startsWith("http://localhost:8080/uploads/"));
        assertTrue(url.contains("photo.jpg"));
        // UUID prefix: 36 chars + underscore
        String filename = url.replace("http://localhost:8080/uploads/", "");
        assertTrue(filename.length() > 37);
    }

    @Test
    void store_validPngFile_returnsUrl() {
        MockMultipartFile file = new MockMultipartFile(
                "image", "image.png", "image/png", new byte[2048]);

        String url = storageService.store(file);

        assertTrue(url.startsWith("http://localhost:8080/uploads/"));
        assertTrue(url.contains("image.png"));
    }

    @Test
    void store_validWebpFile_returnsUrl() {
        MockMultipartFile file = new MockMultipartFile(
                "image", "photo.webp", "image/webp", new byte[512]);

        String url = storageService.store(file);

        assertTrue(url.startsWith("http://localhost:8080/uploads/"));
        assertTrue(url.contains("photo.webp"));
    }

    @Test
    void store_fileActuallyWrittenToDisk() throws IOException {
        byte[] content = "fake image data".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "image", "test.jpg", "image/jpeg", content);

        String url = storageService.store(file);
        String filename = url.replace("http://localhost:8080/uploads/", "");

        Path storedFile = tempDir.resolve(filename);
        assertTrue(Files.exists(storedFile));
        assertArrayEquals(content, Files.readAllBytes(storedFile));
    }

    @Test
    void store_unsupportedContentType_throwsUnsupportedMediaTypeException() {
        MockMultipartFile file = new MockMultipartFile(
                "image", "doc.pdf", "application/pdf", new byte[1024]);

        UnsupportedMediaTypeException ex = assertThrows(
                UnsupportedMediaTypeException.class,
                () -> storageService.store(file));

        assertTrue(ex.getMessage().contains("Unsupported file type"));
    }

    @Test
    void store_nullContentType_throwsUnsupportedMediaTypeException() {
        MockMultipartFile file = new MockMultipartFile(
                "image", "file.bin", null, new byte[1024]);

        assertThrows(UnsupportedMediaTypeException.class, () -> storageService.store(file));
    }

    @Test
    void store_fileTooLarge_throwsFileSizeExceededException() {
        byte[] largeContent = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile file = new MockMultipartFile(
                "image", "large.jpg", "image/jpeg", largeContent);

        FileSizeExceededException ex = assertThrows(
                FileSizeExceededException.class,
                () -> storageService.store(file));

        assertTrue(ex.getMessage().contains("exceeds maximum allowed size"));
    }

    @Test
    void store_fileExactly5MB_succeeds() {
        byte[] content = new byte[5 * 1024 * 1024]; // exactly 5MB
        MockMultipartFile file = new MockMultipartFile(
                "image", "exact.jpg", "image/jpeg", content);

        String url = storageService.store(file);

        assertNotNull(url);
        assertTrue(url.startsWith("http://localhost:8080/uploads/"));
    }

    @Test
    void store_emptyFile_throwsUnsupportedMediaTypeException() {
        MockMultipartFile file = new MockMultipartFile(
                "image", "empty.jpg", "image/jpeg", new byte[0]);

        assertThrows(UnsupportedMediaTypeException.class, () -> storageService.store(file));
    }

    @Test
    void store_twoFilesWithSameName_produceDifferentFilenames() {
        MockMultipartFile file1 = new MockMultipartFile(
                "image", "photo.jpg", "image/jpeg", new byte[100]);
        MockMultipartFile file2 = new MockMultipartFile(
                "image", "photo.jpg", "image/jpeg", new byte[100]);

        String url1 = storageService.store(file1);
        String url2 = storageService.store(file2);

        assertNotEquals(url1, url2);
    }

    @Test
    void delete_existingFile_removesFromDisk() throws IOException {
        // Store a file first
        MockMultipartFile file = new MockMultipartFile(
                "image", "todelete.jpg", "image/jpeg", "data".getBytes());
        String url = storageService.store(file);
        String filename = url.replace("http://localhost:8080/uploads/", "");

        // Verify it exists
        assertTrue(Files.exists(tempDir.resolve(filename)));

        // Delete it
        storageService.delete(filename);

        // Verify it's gone
        assertFalse(Files.exists(tempDir.resolve(filename)));
    }

    @Test
    void delete_nonExistentFile_doesNotThrow() {
        assertDoesNotThrow(() -> storageService.delete("nonexistent.jpg"));
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
