package com.pms.backend.controller;

import com.pms.backend.model.User;
import com.pms.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private static final double STARTER_CLAIM_AMOUNT = 500.0;

    private final AuthService authService;

    public WalletController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/claim")
    public ResponseEntity<?> claimStarterCoins(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("USER_ID") == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        Long userId = (Long) session.getAttribute("USER_ID");
        User user = authService.findById(userId);

        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        if (user.isStarterClaimed()) {
            return ResponseEntity.badRequest().body("Starter coins already claimed");
        }

        user.setBalance(user.getBalance() + STARTER_CLAIM_AMOUNT);
        user.setStarterClaimed(true);
        authService.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Starter coins claimed successfully",
                "userId", user.getId(),
                "balance", user.getBalance(),
                "starterClaimed", user.isStarterClaimed()
        ));
    }
}