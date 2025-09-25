package com.example.nebulashare.controller;

import com.example.nebulashare.model.FileData;
import com.example.nebulashare.model.User;
import com.example.nebulashare.service.FileStorageService;
import com.example.nebulashare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserService userService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
            FileData fileData = fileStorageService.storeFile(file, user);
            return ResponseEntity.ok(fileData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Could not upload the file: " + e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<FileData>> getUserFiles(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
        List<FileData> files = fileStorageService.getFilesByUser(user);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
        Optional<FileData> fileDataOptional = fileStorageService.getFile(fileId);
        if (fileDataOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        FileData fileData = fileDataOptional.get();
        Resource resource = fileStorageService.loadFileAsResource(fileId, user);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileData.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileData.getFileName() + "\"")
                .body(resource);
    }

    @PostMapping("/share/{fileId}")
    public ResponseEntity<?> createShareableLink(@PathVariable String fileId, @RequestBody Map<String, String> payload) {
        try {
            String link = fileStorageService.createShareableLink(fileId, payload.get("type"));
            return ResponseEntity.ok(Map.of("link", link));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
            fileStorageService.deleteFile(fileId, user);
            return ResponseEntity.ok(Map.of("message", "File deleted successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
