package com.renderai.controller;

import com.renderai.entity.Role;
import com.renderai.entity.User;
import com.renderai.repository.UserRepository;
import com.renderai.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository,
                          JwtTokenProvider jwtTokenProvider,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Đăng nhập hệ thống (Phân quyền ADMIN / USER) & Sinh JWT Token
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String usernameOrEmail = loginRequest.get("username");
        String password = loginRequest.get("password");

        if (usernameOrEmail == null || usernameOrEmail.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu"
            ));
        }

        // Tìm user theo username hoặc email
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail.trim());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(usernameOrEmail.trim());
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Tài khoản không tồn tại trong hệ thống"
            ));
        }

        User user = userOpt.get();

        // Kiểm tra mật khẩu (hỗ trợ cả BCrypt đã mã hóa và mật khẩu plaintext cũ)
        boolean isMatch = passwordEncoder.matches(password.trim(), user.getPassword())
                || password.trim().equals(user.getPassword());

        if (!isMatch) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Mật khẩu không chính xác"
            ));
        }

        // Nâng cấp mật khẩu plaintext cũ sang BCrypt hash trong DB nếu chưa được mã hóa
        if (password.trim().equals(user.getPassword()) && !user.getPassword().startsWith("$2a$")) {
            try {
                user.setPassword(passwordEncoder.encode(password.trim()));
                userRepository.save(user);
            } catch (Exception e) {
                System.err.println("Không thể cập nhật mật khẩu sang BCrypt: " + e.getMessage());
            }
        }

        // Sinh JWT Access Token
        String token = jwtTokenProvider.generateToken(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đăng nhập thành công",
                "accessToken", token,
                "tokenType", "Bearer",
                "user", Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                )
        ));
    }

    /**
     * Đăng ký tài khoản mới (Mã hóa mật khẩu bằng BCrypt, sinh JWT Token ngay)
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> regRequest) {
        String username = regRequest.get("username");
        String email = regRequest.get("email");
        String password = regRequest.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Vui lòng điền tên đăng nhập và mật khẩu"
            ));
        }

        if (userRepository.existsByUsername(username.trim())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Tên đăng nhập này đã được sử dụng"
            ));
        }

        String safeEmail = (email != null && !email.isBlank()) ? email.trim() : (username.trim() + "@renderai.com");
        if (userRepository.existsByEmail(safeEmail)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Email này đã được sử dụng"
            ));
        }

        User newUser = User.builder()
                .username(username.trim())
                .email(safeEmail)
                .password(passwordEncoder.encode(password.trim()))
                .role(Role.USER)
                .build();

        User saved = userRepository.save(newUser);

        // Sinh JWT Token cho user vừa đăng ký
        String token = jwtTokenProvider.generateToken(
                saved.getId(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getRole()
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đăng ký tài khoản thành công",
                "accessToken", token,
                "tokenType", "Bearer",
                "user", Map.of(
                        "id", saved.getId(),
                        "username", saved.getUsername(),
                        "email", saved.getEmail(),
                        "role", saved.getRole().name()
                )
        ));
    }

    /**
     * Xác thực Token & Lấy thông tin tài khoản hiện tại
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Token xác thực không hợp lệ hoặc không được cung cấp"
            ));
        }

        String token = authHeader.substring(7).trim();
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Token đã hết hạn hoặc không hợp lệ"
            ));
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy định danh người dùng trong Token"
            ));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Tài khoản không tồn tại trên hệ thống"
            ));
        }

        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                )
        ));
    }
}

