package com.pms.backend.controller;

import com.pms.backend.dto.MarketOdds;
import com.pms.backend.model.Market;
import com.pms.backend.model.Position;
import com.pms.backend.repository.MarketRepository;
import com.pms.backend.repository.PositionRepository;
import com.pms.backend.service.OddsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class MarketController {

    private final MarketRepository marketRepository;
    private final PositionRepository positionRepository;
    private final OddsService oddsService;

    public MarketController(
            MarketRepository marketRepository,
            PositionRepository positionRepository,
            OddsService oddsService) {
        this.marketRepository = marketRepository;
        this.positionRepository = positionRepository;
        this.oddsService = oddsService;
    }

    /**
     * GET /api/markets
     *
     * Returns the current (latest) BTC prediction market.
     * Pure read — the scheduler manages market lifecycle.
     *
     * Response contract:
     * - id (Long)
     * - title (String)
     * - pair (String)
     * - startingPrice (Double)
     * - endingPrice (Double)
     * - startingDate (String ISO)
     * - endingDate (String ISO)
     * - status (String: OPEN/CLOSED)
     * - result (String: UP/DOWN/null)
     * - yesProbability (Double)
     * - noProbability (Double)
     *
     * Returns 204 No Content if no market has been created yet.
     */
    @GetMapping("/markets")
    public ResponseEntity<?> getMarkets() {
        Optional<Market> marketOptional = marketRepository.findTopByOrderByIdDesc();

        if (marketOptional.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        Market market = marketOptional.get();
        MarketOdds odds = oddsService.calculateOdds(market.getId());

        Map<String, Object> btcMarket = new java.util.LinkedHashMap<>();
        btcMarket.put("id", market.getId());
        btcMarket.put("title", market.getTitle());
        btcMarket.put("pair", "BTCUSDT");
        btcMarket.put("startingPrice", market.getStartingPrice());
        btcMarket.put("endingPrice", market.getEndingPrice());
        btcMarket.put("startingDate", market.getStartingDate().toString());
        btcMarket.put("endingDate", market.getEndingDate().toString());
        btcMarket.put("status", market.getStatus());
        btcMarket.put("result", market.getResult());
        btcMarket.put("yesProbability", odds.upProbability());
        btcMarket.put("noProbability", odds.downProbability());

        return ResponseEntity.ok(List.of(btcMarket));
    }

    /**
     * POST /api/position
     * Saves a BTC UP/DOWN position.
     */
    @PostMapping("/position")
    public ResponseEntity<?> createPosition(
            @RequestBody CreatePositionRequest request,
            HttpServletRequest httpRequest
    ) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("USER_ID") == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        Long authenticatedUserId = (Long) session.getAttribute("USER_ID");
        if (request.getMarketId() == null ||
                request.getPositionType() == null ||
                request.getAmount() == null) {
            return ResponseEntity.badRequest().body("marketId, positionType and amount are required");
        }

        String positionType = request.getPositionType().trim().toUpperCase();
        if (!positionType.equals("UP") && !positionType.equals("DOWN")) {
            return ResponseEntity.badRequest().body("positionType must be UP or DOWN");
        }

        if (request.getAmount() <= 0) {
            return ResponseEntity.badRequest().body("amount must be greater than 0");
        }

        Optional<Market> marketOptional = marketRepository.findById(request.getMarketId());
        if (marketOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Market not found");
        }

        Market market = marketOptional.get();

        if (!"OPEN".equals(market.getStatus())) {
            return ResponseEntity.badRequest().body("Market is not open");
        }

        Position position = new Position();
        position.setUserId(authenticatedUserId);
        position.setMarket(market);
        position.setPositionType(positionType);
        position.setAmount(request.getAmount());
        position.setCreatedAt(LocalDateTime.now());

        Position savedPosition = positionRepository.save(position);

        return ResponseEntity.ok(Map.of(
                "message", "Position created successfully",
                "positionId", savedPosition.getId(),
                "marketId", savedPosition.getMarket().getId(),
                "userId", savedPosition.getUserId(),
                "positionType", savedPosition.getPositionType(),
                "amount", savedPosition.getAmount()));
    }

    /**
     * GET /api/positions/me
     * Returns all positions for the authenticated user.
     */
    @GetMapping("/positions/me")
    public ResponseEntity<?> getMyPositions(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("USER_ID") == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        Long authenticatedUserId = (Long) session.getAttribute("USER_ID");

        List<Map<String, Object>> positions = positionRepository
                .findByUserIdOrderByCreatedAtDesc(authenticatedUserId)
                .stream()
                .map(position -> Map.<String, Object>of(
                        "positionId", position.getId(),
                        "marketId", position.getMarket().getId(),
                        "marketTitle", position.getMarket().getTitle(),
                        "marketStatus", position.getMarket().getStatus(),
                        "marketResult", position.getMarket().getResult() != null ? position.getMarket().getResult() : "PENDING",                        
                        "userId", position.getUserId(),
                        "positionType", position.getPositionType(),
                        "amount", position.getAmount(),
                        "positionResult", position.getResult() != null ? position.getResult() : "PENDING",
                        "createdAt", position.getCreatedAt().toString()
                ))
                .toList();

        return ResponseEntity.ok(positions);
    }

    public static class CreatePositionRequest {
        private Long marketId;
        private String positionType;
        private Double amount;

        public Long getMarketId() {
            return marketId;
        }

        public void setMarketId(Long marketId) {
            this.marketId = marketId;
        }

        public String getPositionType() {
            return positionType;
        }

        public void setPositionType(String positionType) {
            this.positionType = positionType;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }
    }

    /**
     * GET /api/resolve
     *
     * Returns the result of the last (most recently closed) market.
     * Read-only — no request body, no side effects.
     */
    @GetMapping("/resolve")
    public ResponseEntity<?> getLastMarketResult() {
        return marketRepository.findTopByStatusOrderByIdDesc("CLOSED")
                .map(market -> ResponseEntity.ok(Map.of(
                        "marketId", market.getId(),
                        "endingPrice", market.getEndingPrice(),
                        "result", market.getResult() != null ? market.getResult() : "PENDING",
                        "status", market.getStatus())))
                .orElse(ResponseEntity.status(404).build());
    }
}