package com.pms.backend.controller;

import com.pms.backend.model.Market;
import com.pms.backend.model.Position;
import com.pms.backend.repository.MarketRepository;
import com.pms.backend.repository.PositionRepository;
import com.pms.backend.service.BybitApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class MarketController {

    private final BybitApiService bybitApiService;
    private final MarketRepository marketRepository;
    private final PositionRepository positionRepository;
    private final com.pms.backend.service.PositionService positionService;

    public MarketController(
            BybitApiService bybitApiService,
            MarketRepository marketRepository,
            PositionRepository positionRepository,
            com.pms.backend.service.PositionService positionService
    ) {
        this.bybitApiService = bybitApiService;
        this.marketRepository = marketRepository;
        this.positionRepository = positionRepository;
        this.positionService = positionService;
    }

    /**
     * GET /api/markets
     *
     * Returns a single BTC prediction market (MVP scope).
     *
     * Stable response contract for frontend integration:
     * - id (Long)
     * - title (String)
     * - pair (String)
     * - startingPrice (Double)
     * - startingDate (String ISO)
     * - endingDate (String ISO)
     * - status (String: OPEN/CLOSED)
     * - yesProbability (Double)
     * - noProbability (Double)
     *
     * Notes:
     * - Single BTC market only
     * - Hardcoded response (no DB dependency in this task)
     * - No multi-market support
     */
    @GetMapping("/markets")
    public ResponseEntity<?> getMarkets() {
        Double currentPrice = bybitApiService.marketOrderPrice();

        if (currentPrice == null) {
            return ResponseEntity.status(500).body("Failed to fetch BTC price");
        }

        Map<String, Object> btcMarket = Map.of(
            "id", 1,
            "title", "BTC 5 Minute UP or DOWN",
            "pair", bybitApiService.marketPair(),
            "startingPrice", currentPrice,
            "startingDate", LocalDateTime.now().toString(),
            "endingDate", LocalDateTime.now().plusMinutes(5).toString(),
            "status", "OPEN",
            "yesProbability", 50.0,
            "noProbability", 50.0
        );

        return ResponseEntity.ok(List.of(btcMarket));
    }

    /**
     * POST /api/position
     * Saves a BTC UP/DOWN position.
     */
    @PostMapping("/position")
    public ResponseEntity<?> createPosition(@RequestBody CreatePositionRequest request) {
        if (request.getMarketId() == null ||
                request.getUserId() == null ||
                request.getPositionType() == null ||
                request.getAmount() == null) {
            return ResponseEntity.badRequest().body("marketId, userId, positionType and amount are required");
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

        Position position = new Position();
        position.setUserId(request.getUserId());
        position.setMarket(marketOptional.get());
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
            "amount", savedPosition.getAmount()
        ));
    }

    public static class CreatePositionRequest {
        private Long marketId;
        private Long userId;
        private String positionType;
        private Double amount;

        public Long getMarketId() {
            return marketId;
        }

        public void setMarketId(Long marketId) {
            this.marketId = marketId;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
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
     * POST /api/resolve
     *
     * Resolves a BTC prediction market.
     *
     * Input:
     * - marketId
     * - result (UP/DOWN)
     *
     * Actions:
     * - updates all positions (WIN/LOSS)
     * - sets market result
     * - sets market status to CLOSED
     */
    @PostMapping("/resolve")
    public ResponseEntity<?> resolveMarket(@RequestBody ResolveRequest request) {

        if (request.getMarketId() == null || request.getResult() == null) {
            return ResponseEntity.badRequest().body("marketId and result are required");
        }

        String result = request.getResult().trim().toUpperCase();
        if (!result.equals("UP") && !result.equals("DOWN")) {
            return ResponseEntity.badRequest().body("result must be UP or DOWN");
        }

        Optional<Market> marketOptional = marketRepository.findById(request.getMarketId());
        if (marketOptional.isEmpty()) {
            return ResponseEntity.status(404).body("Market not found");
        }

        Market market = marketOptional.get();

        // Resolve positions (WIN / LOSS)
        positionService.resolveAllPositionsForMarket(market.getId(), result);

        // Update market
        market.setResult(result);
        market.setStatus("CLOSED");

        marketRepository.save(market);

        return ResponseEntity.ok(Map.of(
                "message", "Market resolved successfully",
                "marketId", market.getId(),
                "result", result,
                "status", market.getStatus()
        ));
    }

    public static class ResolveRequest {
        private Long marketId;
        private String result;

        public Long getMarketId() { return marketId; }
        public void setMarketId(Long marketId) { this.marketId = marketId; }

        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }
    }
}