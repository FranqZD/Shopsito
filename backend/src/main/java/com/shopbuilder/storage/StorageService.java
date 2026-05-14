package com.shopbuilder.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction for file storage operations.
 * Implementations handle storing and deleting files in different environments.
 */
public interface StorageService {

    /**
     * Stores the given file and returns its publicly accessible URL.
     *
     * @param file the multipart file to store
     * @return the publicly accessible URL of the stored file
     */
    String store(MultipartFile file);

    /**
     * Deletes the file with the given filename from storage.
     *
     * @param filename the name of the file to delete
     */
    void delete(String filename);
}
