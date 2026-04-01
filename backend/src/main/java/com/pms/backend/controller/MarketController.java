package com.pms.backend.controller;

import com.pms.backend.service.BybitApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MarketController {

    private final BybitApiService bybitApiService;

    public MarketController(BybitApiService bybitApiService) {
        this.bybitApiService = bybitApiService;
    }

    /**
     * GET /api/markets
     * Returns active prediction markets.
     * MVP scope: only BTC 5-minute UP/DOWN market.
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
}