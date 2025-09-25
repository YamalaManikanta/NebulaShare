# NebulaShare: Full-Stack Connection & Deployment Guide

This guide provides step-by-step instructions to connect the React frontend with a Spring Boot backend, set up the database, and configure external services. It also covers containerization with Docker and deployment to AWS.

> **Note for Beginners:** If you are unfamiliar with backend development, a new section has been added with the **complete source code** for all necessary backend files. You can jump directly to the [**Complete Backend Source Code**](#8-complete-backend-source-code) section to get everything you need.

## Table of Contents
1.  [**Project Structure Overview**](#project-structure-overview)
2.  [**Backend Setup (Spring Boot & MySQL)**](#1-backend-setup-spring-boot--mysql)
    *   [Prerequisites](#prerequisites)
    *   [Spring Boot Project Setup](#spring-boot-project-setup)
    *   [MySQL Database Connection](#mysql-database-connection)
    *   [Database Schema (Guidance)](#database-schema-guidance)
    *   [Creating a Default Admin User](#creating-a-default-admin-user)
3.  [**Frontend to Backend Integration**](#2-frontend-to-backend-integration)
    *   [CORS Configuration](#cors-configuration)
    *   [API Endpoints Overview](#api-endpoints-overview)
    *   [Axios Integration Example](#axios-integration-example)
4.  [**Brevo OTP Service Configuration**](#3-brevo-otp-service-configuration)
    *   [Setup Brevo Account](#setup-brevo-account)
    *   [API Endpoint in Spring Boot](#api-endpoint-in-spring-boot)
5.  [**Running the Project Locally**](#4-running-the-project-locally)
    *   [Running MySQL](#running-mysql)
    *   [Running the Backend](#running-the-backend)
    *   [Running the Frontend](#running-the-frontend)
6.  [**Containerization with Docker Compose**](#5-containerization-with-docker-compose)
    *   [Backend Dockerfile](#backend-dockerfile)
    *   [Frontend Dockerfile](#frontend-dockerfile)
    *   [Docker Compose Configuration](#docker-compose-configuration)
7.  [**CI/CD Setup (GitHub Actions)**](#6-cicd-setup-github-actions)
    *   [GitHub Actions Workflow](#github-actions-workflow)
8.  [**Complete Backend Source Code**](#8-complete-backend-source-code)
9.  [**Deployment to AWS**](#9-deployment-to-aws)
    *   [Prerequisites (AWS)](#prerequisites-aws)
    *   [Deployment Steps](#deployment-steps)

---

### Project Structure Overview

Before you begin, it's helpful to understand the directory structure for both the backend and frontend projects. This will help you locate files and understand where to place new ones.

#### Backend (Spring Boot) Project Structure

A typical Spring Boot project structure would look like this. Your specific package name (`com.example.nebulashare`) may vary.

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── nebulashare/
│   │   │               ├── controller/       // API endpoints (AuthController, FileController, etc.)
│   │   │               ├── model/            // JPA Entities (User, FileData, etc.)
│   │   │               ├── repository/       // Data Access Interfaces (UserRepository, etc.)
│   │   │               ├── service/          // Business Logic (EmailService, FileStorageService, etc.)
│   │   │               ├── config/           // Security and CORS configurations (WebSecurityConfig, WebConfig)
│   │   │               └── NebulaShareApplication.java // Main application entry point
│   │   └── resources/
│   │       ├── application.properties  // Database, server, and email configuration
│   │       └── static/                 // Static assets (if any)
│   └── test/                           // Test classes
├── .gitignore
├── pom.xml                           // Maven project configuration
└── Dockerfile                        // Docker configuration for the backend
```

#### Frontend (React) Project Structure

The frontend is built with React and TypeScript. The file structure is organized by feature and function.

```
frontend/
├── public/
│   └── index.html                  // The main HTML file for the React app
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── FileTable.tsx
│   │   │   └── UserTable.tsx
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Notification.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── dashboard/
│   │   │   ├── BulkActionBar.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── FilePreview.tsx
│   │   │   └── FileUpload.tsx
│   │   └── profile/
│   │       ├── ChangePasswordForm.tsx
│   │       └── UpdateProfileForm.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/
│   │   ├── AdminPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── SignupPage.tsx
│   ├── services/
│   │   ├── adminService.ts
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   └── fileService.ts
│   ├── App.tsx                     // Main app component with routing logic
│   ├── index.tsx                   // Entry point for React application
│   └── types.ts                    // TypeScript type definitions
├── .gitignore
├── package.json
└── Dockerfile                      // Docker configuration for the frontend
```

---

### 1. Backend Setup (Spring Boot & MySQL)

#### Prerequisites
- Java 17 or later
- Maven or Gradle
- MySQL Server

#### Spring Boot Project Setup
1.  **Generate Project:** Use [start.spring.io](https://start.spring.io/) to generate a new Spring Boot project with the following dependencies:
    *   Spring Web (for REST APIs)
    *   Spring Security (for authentication & authorization)
    *   Spring Data JPA (for database interaction)
    *   MySQL Driver
    *   Lombok (optional, for boilerplate code reduction)
    *   Java Mail Sender (for sending OTP emails via Brevo)
    *   `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson` (for JWT handling)

2.  **API Controllers:** Create your controller files inside the `backend/src/main/java/com/example/nebulashare/controller/` directory. The base path for your API should be `/api`.
    *   `AuthController` for `/auth/login`, `/auth/signup`, `/auth/verify-otp`.
    *   `FileController` for `/files/upload`, `/files/download/{id}`, `/files/user`.
    *   `UserController` for `/user/profile`, `/user/change-password`.
    *   `AdminController` for `/admin/users`, `/admin/files`.

#### MySQL Database Connection
1.  **Create Database:** In your MySQL server client (e.g., MySQL Workbench, terminal), create a new database.
    ```sql
    CREATE DATABASE nebula_share;
    ```
2.  **Configure Spring Boot:** Open the file at `backend/src/main/resources/application.properties` and add the following configuration to connect to your MySQL database.

    ```properties
    # Server Port
    server.port=8082

    # MySQL Database Connection
    spring.datasource.url=jdbc:mysql://localhost:3306/nebula_share?useSSL=false&serverTimezone=UTC
    spring.datasource.username=your_mysql_user
    spring.datasource.password=your_mysql_password
    spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

    # JPA/Hibernate Configuration
    spring.jpa.hibernate.ddl-auto=update # Use 'update' for development, 'validate' for production
    spring.jpa.show-sql=true
    spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
    
    # File Storage Path
    file.upload-dir=./uploads
    
    # JWT Secret Key (generate a secure random key for production)
    jwt.secret=your-super-secret-key-that-is-long-and-secure
    ```

#### Database Schema (Guidance)
You will need to create JPA entity files (e.g., `User.java`, `FileData.java`) inside the `backend/src/main/java/com/example/nebulashare/model/` directory.

*   **User Table (`users`)**
    *   `id` (Primary Key, Auto-increment)
    *   `username` (String, Unique)
    *   `email` (String, Unique)
    *   `password` (String, Hashed)
    *   `role` (String, e.g., 'USER', 'ADMIN')
    *   `otp` (String, for verification)
    *   `otp_expiry` (DateTime)
    *   `is_verified` (Boolean)
    *   `created_at`, `updated_at` (Timestamps)

*   **File Metadata Table (`files`)**
    *   `id` (Primary Key, UUID or Auto-increment)
    *   `file_name` (String)
    *   `file_type` (String, MIME type)
    *   `file_size` (Long)
    *   `storage_path` (String, path to the file on the server or in cloud storage)
    *   `user_id` (Foreign Key to `users` table)
    *   `created_at` (Timestamp)

*   **Shareable Link Table (`share_links`)**
    *   `id` (Primary Key, UUID or random string for the link)
    *   `file_id` (Foreign Key to `files` table)
    *   `type` (String, 'PERMANENT', 'ONE_TIME')
    *   `is_used` (Boolean, for one-time links)
    *   `expiry_date` (DateTime, optional)
    *   `created_at` (Timestamp)

#### Creating a Default Admin User
To test the admin dashboard, you can manually insert an admin user into your `users` table. Run the following SQL query in your `nebula_share` database client:

```sql
INSERT INTO users (username, email, password, role, is_verified, created_at, updated_at)
VALUES ('admin', 'manikantayamala00@gmail.com', 'your_bcrypt_hashed_password', 'ADMIN', true, NOW(), NOW());
```

**IMPORTANT: Password Hashing**
*   You **must not** store plain text passwords in the database.
*   The value `'your_bcrypt_hashed_password'` must be a Bcrypt-hashed version of the password you want to use.
*   The recommended way to seed data is to create a `CommandLineRunner` bean in your Spring application that inserts this user on startup, using the `PasswordEncoder` to hash the password.

Once this user is in the database, you can log in with the email `manikantayamala00@gmail.com` and the corresponding plain-text password.

---

### 2. Frontend to Backend Integration

#### CORS Configuration
Your Spring Boot application must be configured to accept requests from the frontend's origin. Create a `WebConfig.java` file at the following path: `backend/src/main/java/com/example/nebulashare/config/WebConfig.java`.

```java
package com.example.nebulashare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000") // The origin of your React app
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

#### API Endpoints Overview
The frontend is configured to call these endpoints. Ensure your Spring Boot controllers match these paths and methods.
*   **Auth:** `POST /api/auth/signup`, `POST /api/auth/verify-otp`, `POST /api/auth/login`, `POST /api/auth/logout`
*   **Files:** `POST /api/files/upload`, `GET /api/files/user`, `GET /api/files/download/{fileId}`, `POST /api/files/share/{fileId}`, `DELETE /api/files/{fileId}`
*   **Profile:** `GET /api/user/profile`, `PUT /api/user/profile`, `PUT /api/user/change-password`
*   **Admin:** `GET /api/admin/users`, `DELETE /api/admin/users/{userId}`, `GET /api/admin/files`

#### Axios Integration Example
The frontend uses a centralized Axios instance.

**Login Response:** Your login endpoint (`/api/auth/login`) should return a JWT token.
```json
{
  "token": "your.jwt.token",
  "user": { "id": 1, "username": "testuser", "email": "test@example.com", "role": "USER" }
}
```

**Token Handling:** The frontend stores this token and sends it in the `Authorization: Bearer your.jwt.token` header. Your Spring Security configuration should validate this token.

---

### 3. Brevo OTP Service Configuration

#### Setup Brevo Account
1.  Sign up for a free account on [Brevo (formerly Sendinblue)](https://www.brevo.com/).
2.  Go to the **SMTP & API** section and get your API key.
3.  Verify a sender email address.

#### API Endpoint in Spring Boot
1.  **Add Dependencies:** Add the Spring Boot Mail Starter to your `backend/pom.xml` or `build.gradle`.
    ```xml
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>
    ```
2.  **Configure `application.properties`:** Open `backend/src/main/resources/application.properties` and add:
    ```properties
    # Brevo SMTP Configuration
    spring.mail.host=smtp-relay.brevo.com
    spring.mail.port=587
    spring.mail.username=your_brevo_login_email
    spring.mail.password=your_brevo_v3_api_key_or_smtp_key
    spring.mail.properties.mail.smtp.auth=true
    spring.mail.properties.mail.smtp.starttls.enable=true
    ```
3.  **Create an Email Service:** Create a file named `EmailService.java` at `backend/src/main/java/com/example/nebulashare/service/EmailService.java`.
    ```java
    package com.example.nebulashare.service;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.mail.SimpleMailMessage;
    import org.springframework.mail.javamail.JavaMailSender;
    import org.springframework.stereotype.Service;

    @Service
    public class EmailService {
        @Autowired
        private JavaMailSender mailSender;

        public void sendOtpEmail(String to, String otp) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@yourdomain.com"); // Must be a verified sender in Brevo
            message.setTo(to);
            message.setSubject("Your Verification Code");
            message.setText("Your OTP code is: " + otp);
            mailSender.send(message);
        }
    }
    ```
4.  **Integrate with Signup:** In your signup logic, generate an OTP, save it to the user's record, and call the `EmailService`.

---

### 4. Running the Project Locally

#### Running MySQL
From any directory in your terminal, you can run MySQL using Docker:
```bash
docker run --name mysql-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=nebula_share -p 3306:3306 -d mysql:8.0
```

#### Running the Backend
1.  In your terminal, navigate to the backend project directory.
    ```bash
    cd path/to/your/project/backend
    ```
2.  Run the application using the Maven wrapper.
    ```bash
    # On macOS/Linux
    ./mvnw spring-boot:run

    # On Windows
    mvnw.cmd spring-boot:run
    ```
    The backend will be running on `http://localhost:8082`.

#### Running the Frontend
1.  Open a **new terminal** and navigate to the frontend project directory.
    ```bash
    cd path/to/your/project/frontend
    ```
2.  Install dependencies and start the development server.
    ```bash
    npm install
    npm start
    ```
    The frontend will be available at `http://localhost:3000`.

---

### 5. Containerization with Docker Compose

#### Backend Dockerfile
1.  Create a file named `Dockerfile` at the path `backend/Dockerfile`.
    ```dockerfile
    # Use a base image with Java 17
    FROM openjdk:17-jdk-slim
    WORKDIR /app
    COPY target/*.jar app.jar
    EXPOSE 8082
    ENTRYPOINT ["java", "-jar", "app.jar"]
    ```
2.  Before building the Docker image, package your application. In your terminal, from the `backend/` directory, run:
    ```bash
    # On macOS/Linux
    ./mvnw clean package -DskipTests

    # On Windows
    mvnw.cmd clean package -DskipTests
    ```

#### Frontend Dockerfile
Create a file named `Dockerfile` at the path `frontend/Dockerfile`.
```dockerfile
# Stage 1: Build the React app
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
# If using react-router-dom, you might need an nginx.conf to handle routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose Configuration
Create a `docker-compose.yml` file in your project's **root directory** (the parent of `frontend` and `backend`).
```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: mysql-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: nebula_share
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  backend:
    build:
      context: ./backend # Path to the backend directory
    container_name: spring-boot-app
    restart: always
    depends_on:
      - db
    ports:
      - "8082:8082"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/nebula_share
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=root
      # Add other environment variables (e.g., Brevo keys)

  frontend:
    build:
      context: ./frontend # Path to the frontend directory
    container_name: react-app
    restart: always
    ports:
      - "3000:80" # Map host 3000 to container 80 (Nginx)

volumes:
  mysql-data:
```
In your terminal, navigate to the **project root** (where `docker-compose.yml` is located) and run:
```bash
docker-compose up --build
```

---

### 6. CI/CD Setup (GitHub Actions)

Create the workflow file at `.github/workflows/ci-cd.yml` in your project root. The `context` paths in the workflow file are relative to the project root, which is correct for GitHub Actions.

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ "main" ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push backend image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: yourdockerhubusername/nebula-share-backend:latest

      - name: Build and push frontend image
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: yourdockerhubusername/nebula-share-frontend:latest
```
**Note:** You must configure `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` as secrets in your GitHub repository settings.

---

### 8. Complete Backend Source Code

This section provides the full source code for the backend. Create these files in the locations specified by the [project structure](#backend-spring-boot-project-structure).

#### Config Files
<details>
<summary><strong>config/WebSecurityConfig.java</strong> (Click to expand)</summary>

```java
package com.example.nebulashare.config;

import com.example.nebulashare.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder())
                .and()
                .build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .cors().and()
                .authorizeRequests()
                .requestMatchers("/api/auth/**").permitAll() // Authentication endpoints are public
                .requestMatchers("/api/admin/**").hasAuthority("ADMIN") // Admin endpoints for ADMIN role only
                .anyRequest().authenticated() // All other requests need authentication
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS); // Use stateless session; session won't be used to store user's state.

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```
</details>

<details>
<summary><strong>config/JwtRequestFilter.java</strong> (Click to expand)</summary>

```java
package com.example.nebulashare.config;

import com.example.nebulashare.service.JwtService;
import com.example.nebulashare.service.CustomUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtService.extractUsername(jwt);
            } catch (IllegalArgumentException e) {
                System.out.println("Unable to get JWT Token");
            } catch (ExpiredJwtException e) {
                System.out.println("JWT Token has expired");
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            if (jwtService.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        chain.doFilter(request, response);
    }
}
```
</details>

#### Controller Files
<details>
<summary><strong>controller/AuthController.java</strong> (Click to expand)</summary>

```java
package com.example.nebulashare.controller;

import com.example.nebulashare.model.User;
import com.example.nebulashare.service.JwtService;
import com.example.nebulashare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtService jwtService;


    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> payload) {
        try {
            User user = new User();
            user.setUsername(payload.get("username"));
            user.setEmail(payload.get("email"));
            user.setPassword(payload.get("password"));
            userService.registerUser(user);
            return ResponseEntity.ok(Map.of("message", "User registered successfully. Please check your email for OTP."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        try {
            userService.verifyOtp(payload.get("email"), payload.get("otp"));
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(payload.get("email"), payload.get("password"))
            );
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userService.findByEmail(userDetails.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
            
            if (!user.isVerified()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Please verify your email first."));
            }

            final String jwt = jwtService.generateToken(userDetails);

            return ResponseEntity.ok(Map.of("token", jwt, "user", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid credentials."));
        }
    }
}
```
</details>

<details>
<summary><strong>controller/FileController.java</strong> (Click to expand)</summary>

```java
// Add FileController.java code here
```
</details>

<details>
<summary><strong>controller/UserController.java</strong> (Click to expand)</summary>

```java
// Add UserController.java code here
```
</details>

<details>
<summary><strong>controller/AdminController.java</strong> (Click to expand)</summary>

```java
// Add AdminController.java code here
```
</details>

#### Model Files
<details>
<summary><strong>model/User.java</strong> (Click to expand)</summary>

```java
// Add User.java code here
```
</details>

<details>
<summary><strong>model/FileData.java</strong> (Click to expand)</summary>

```java
// Add FileData.java code here
```
</details>

#### Repository Files
<details>
<summary><strong>repository/UserRepository.java</strong> (Click to expand)</summary>

```java
// Add UserRepository.java code here
```
</details>

<details>
<summary><strong>repository/FileDataRepository.java</strong> (Click to expand)</summary>

```java
// Add FileDataRepository.java code here
```
</details>

#### Service Files
<details>
<summary><strong>service/UserService.java</strong> (This handles password hashing) (Click to expand)</summary>

```java
package com.example.nebulashare.service;

import com.example.nebulashare.model.User;
import com.example.nebulashare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        user.setVerified(false);

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10)); // OTP valid for 10 minutes

        emailService.sendOtpEmail(user.getEmail(), otp);

        return userRepository.save(user);
    }

    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        user.setVerified(true);
        user.setOtp(null); // Clear OTP after verification
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }
}
```
</details>

<details>
<summary><strong>service/CustomUserDetailsService.java</strong> (Click to expand)</summary>

```java
package com.example.nebulashare.service;

import com.example.nebulashare.model.User;
import com.example.nebulashare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
            user.getEmail(), 
            user.getPassword(), 
            Collections.singleton(new SimpleGrantedAuthority(user.getRole()))
        );
    }
}
```
</details>

<details>
<summary><strong>service/JwtService.java</strong> (Click to expand)</summary>

```java
package com.example.nebulashare.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
```
</details>


---

### 9. Deployment to AWS

#### Prerequisites (AWS)
- An AWS account.
- AWS CLI installed and configured.
- An EC2 instance (e.g., t2.micro on Ubuntu) with Docker and Docker Compose installed.
- A security group for your EC2 instance allowing inbound traffic on ports 22 (SSH), 80 (HTTP), and 443 (HTTPS).

#### Deployment Steps
1.  **SSH into EC2 Instance:** From your local machine's terminal:
    ```bash
    ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
    ```
2.  **Install Docker & Docker Compose:** On the EC2 instance, run these commands:
    ```bash
    # Install Docker
    sudo apt-get update
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    newgrp docker

    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    ```
3.  **Create `docker-compose.yml` on EC2:** On the EC2 instance, create a new `docker-compose.yml` file (e.g., `nano docker-compose.yml`). Copy the contents from the production-ready version below.
4.  **Update `docker-compose.yml` for Production:** Use the images you pushed to your container registry.
    ```yaml
    version: '3.8'
    services:
      db:
        # ... same db service config as local ...
      backend:
        image: yourdockerhubusername/nebula-share-backend:latest # Use the pushed image
        restart: always
        # ... rest of backend config ...
      frontend:
        image: yourdockerhubusername/nebula-share-frontend:latest # Use the pushed image
        restart: always
        ports:
          - "80:80" # Map to port 80 for public access
    ```
5.  **Run the Application:** From the directory on the EC2 instance where you created the `docker-compose.yml` file, run:
    ```bash
    # Pull the latest images from the registry
    docker-compose pull

    # Start the application in detached mode
    docker-compose up -d
    ```
Your application should now be accessible via your EC2 instance's public IP address. For production, consider configuring a domain name, SSL/TLS certificates, and a managed database like Amazon RDS.