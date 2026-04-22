package com.pms.backend.controller;

import com.pms.backend.dto.AuthUserResponse;
import com.pms.backend.dto.LoginRequest;
import com.pms.backend.dto.RegisterRequest;
import com.pms.backend.model.User;
import com.pms.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthUserResponse user = authService.register(request);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body("email and password are required");
        }

        User user = authService.findByEmail(request.getEmail());
        if (user == null || !authService.passwordMatches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("USER_ID", user.getId());

        return ResponseEntity.ok(authService.toResponse(user));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("USER_ID") == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        Long userId = (Long) session.getAttribute("USER_ID");

        return ResponseEntity.ok(Map.of("userId", userId));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok("Logged out");
    }
}