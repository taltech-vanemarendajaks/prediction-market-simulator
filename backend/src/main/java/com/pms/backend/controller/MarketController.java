// src/main/java/com/pms/backend/controller/MarketController.java

package main.java.com.pms.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MarketController {

    @GetMapping("/markets")
    public List<String> getMarkets() {
        return List.of(
            "Will BTC reach 100k?",
            "Will AI replace devs?",
            "Will Estonia GDP grow?"
        );
    }
}