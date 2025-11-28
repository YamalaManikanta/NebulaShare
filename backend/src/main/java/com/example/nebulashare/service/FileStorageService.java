package com.example.nebulashare.service;

import com.example.nebulashare.exception.FileStorageException;
import com.example.nebulashare.model.FileData;
import com.example.nebulashare.model.User;
import com.example.nebulashare.repository.FileDataRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final FileDataRepository fileDataRepository;

    @Autowired
    public FileStorageService(@Value("${file.upload-dir}") String uploadDir, FileDataRepository fileDataRepository) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.fileDataRepository = fileDataRepository;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new FileStorageException("Could not create upload directory.", ex);
        }
    }

    // Store file
    public FileData storeFile(MultipartFile file, User user) {
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        try {
            if (originalFileName.contains("..")) {
                throw new FileStorageException("Invalid path sequence in filename " + originalFileName);
            }

            String fileExtension = "";
            int dotIndex = originalFileName.lastIndexOf('.');
            if (dotIndex > 0) {
                fileExtension = originalFileName.substring(dotIndex);
            }

            String storedFileName = UUID.randomUUID() + fileExtension;
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            FileData fileData = new FileData();
            fileData.setFileName(originalFileName);
            fileData.setFileType(file.getContentType());
            fileData.setFileSize(file.getSize());
            fileData.setFilePath(targetLocation.toString());
            fileData.setUser(user);

            return fileDataRepository.save(fileData);

        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + originalFileName, ex);
        }
    }

    // Get files by user
    public List<FileData> getFilesByUser(User user) {
        return fileDataRepository.findByUser(user);
    }

    // Get file by ID
    public Optional<FileData> getFile(String fileId) {
        return fileDataRepository.findById(fileId);
    }

    // Create shareable link
    public String createShareableLink(String fileId, String type) {
        return "http://localhost:8080/share/" + fileId;
    }

    // Load file as Resource
    public Resource loadFileAsResource(String fileId, User user) {
        FileData fileData = fileDataRepository.findByIdAndUser(fileId, user)
                .orElseThrow(() -> new FileStorageException("File not found: " + fileId));

        try {
            Path filePath = Paths.get(fileData.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) return resource;
            else throw new FileStorageException("File not found: " + fileData.getFileName());
        } catch (MalformedURLException e) {
            throw new FileStorageException("File not found: " + fileData.getFileName(), e);
        }
    }

    // ✅ Delete file
    public void deleteFile(String fileId, User user) {
        FileData fileData = fileDataRepository.findByIdAndUser(fileId, user)
                .orElseThrow(() -> new FileStorageException("File not found or not owned by user: " + fileId));

        try {
            Path filePath = Paths.get(fileData.getFilePath());
            Files.deleteIfExists(filePath);
            fileDataRepository.delete(fileData);
        } catch (IOException e) {
            throw new FileStorageException("Could not delete file: " + fileData.getFileName(), e);
        }
    }
}
