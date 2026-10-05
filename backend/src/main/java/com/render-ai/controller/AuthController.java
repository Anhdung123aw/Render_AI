package com.renderai.controller;

import com.renderai.entity.Role;
import com.renderai.entity.User;
import com.renderai.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Đăng nhập hệ thống (Phân quyền ADMIN / USER)
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

        // Kiểm tra mật khẩu (hỗ trợ cả mật khẩu mặc định đã tạo trong DB)
        if (!password.trim().equals(user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Mật khẩu không chính xác"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đăng nhập thành công",
                "user", Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                )
        ));
    }

    /**
     * Đăng ký tài khoản mới (Mặc định Role: USER)
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
                .password(password.trim())
                .role(Role.USER)
                .build();

        User saved = userRepository.save(newUser);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đăng ký tài khoản thành công",
                "user", Map.of(
                        "id", saved.getId(),
                        "username", saved.getUsername(),
                        "email", saved.getEmail(),
                        "role", saved.getRole().name()
                )
        ));
    }
}
