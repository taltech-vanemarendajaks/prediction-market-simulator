package com.pms.backend.service;

import com.pms.backend.model.Market;
import com.pms.backend.model.MarketType;
import com.pms.backend.repository.MarketRepository;
import com.pms.backend.repository.MarketTypeRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

/**
 * Manages the 5-minute market lifecycle.
 *
 * On each tick (every 5 minutes, aligned to clock):
 *   1. Close the current OPEN market (fetch endingPrice, determine result, resolve positions)
 *   2. Open a new market (fetch startingPrice, set 5-min window)
 *
 * Also runs once on startup via @EventListener(ApplicationReadyEvent) to avoid waiting for the first tick.
 *
 * If the Bybit API is down:
 *   - Close the current market using startingPrice as fallback endingPrice
 *   - Do NOT open a new market (next successful tick will open one)
 */
@Service
@org.springframework.context.annotation.Profile("!test")
public class MarketScheduler {

    private final MarketRepository marketRepository;
    private final MarketTypeRepository marketTypeRepository;
    private final BybitApiService bybitApiService;
    private final PositionService positionService;

    public MarketScheduler(
            MarketRepository marketRepository,
            MarketTypeRepository marketTypeRepository,
            BybitApiService bybitApiService,
            PositionService positionService) {
        this.marketRepository = marketRepository;
        this.marketTypeRepository = marketTypeRepository;
        this.bybitApiService = bybitApiService;
        this.positionService = positionService;
    }

    /**
     * Runs once after the entire application context is ready (including data.sql).
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        tick();
    }

    /**
     * Runs every 5 minutes on clock boundaries: :00, :05, :10, :15, ...
     */
    @Scheduled(cron = "0 0/5 * * * *")
    public void tick() {
        System.out.println("[MarketScheduler] Tick at " + LocalDateTime.now());

        // 1. Close the current OPEN market (if any)
        closeCurrentMarket();

        // 2. Open a new market
        openNewMarket();
    }


    /**
     * Updates the current OPEN market price while the market is still active.
     *
     * This keeps frontend "Current Price" live because FE polling can only show
     * updated values if the backend updates endingPrice before market close.
     */
    @Scheduled(fixedRate = 3000)
    public void updateOpenMarketPrice() {
        Optional<Market> openMarket = marketRepository.findByStatus("OPEN");
        if (openMarket.isEmpty()) {
            return;
        }

        Double currentPrice = bybitApiService.marketOrderPrice();
        if (currentPrice == null) {
            System.err.println("[MarketScheduler] Bybit API down — skipping live price update.");
            return;
        }

        Market market = openMarket.get();
        market.setEndingPrice(currentPrice);
        marketRepository.save(market);
    }

    private void closeCurrentMarket() {
        Optional<Market> openMarket = marketRepository.findByStatus("OPEN");
        if (openMarket.isEmpty()) {
            System.out.println("[MarketScheduler] No OPEN market to close.");
            return;
        }

        Market market = openMarket.get();

        // Fetch ending price — fall back to startingPrice if Bybit is down
        Double endingPrice = bybitApiService.marketOrderPrice();
        if (endingPrice == null) {
            System.err.println("[MarketScheduler] Bybit API down — closing with startingPrice as fallback.");
            endingPrice = market.getStartingPrice();
        }

        // Determine result
        String result = endingPrice >= market.getStartingPrice() ? "UP" : "DOWN";

        // Update market
        market.setEndingPrice(endingPrice);
        market.setResult(result);
        market.setStatus("CLOSED");
        marketRepository.save(market);

        // Resolve all positions and process payouts once
        positionService.resolveMarketAndProcessPayouts(market.getId(), result);

        System.out.println("[MarketScheduler] Closed market #" + market.getId()
                + " | start=" + market.getStartingPrice()
                + " end=" + endingPrice
                + " result=" + result);
    }

    private void openNewMarket() {
        Double startingPrice = bybitApiService.marketOrderPrice();
        if (startingPrice == null) {
            System.err.println("[MarketScheduler] Bybit API down — skipping new market creation.");
            return;
        }

        // Find the default MarketType (seeded by data.sql)
        MarketType marketType = marketTypeRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException(
                        "Default MarketType (id=1) not found. Ensure data.sql has run."));

        LocalDateTime now = LocalDateTime.now();
        // Align to the current 5-minute boundary
        LocalDateTime startingDate = now.truncatedTo(ChronoUnit.HOURS)
                .plusMinutes((now.getMinute() / 5) * 5L);
        LocalDateTime endingDate = startingDate.plusMinutes(5);

        Market market = new Market();
        market.setTitle("BTC 5 Minute UP or DOWN");
        market.setCreatedAt(now);
        market.setStartingPrice(startingPrice);
        market.setEndingPrice(startingPrice); // placeholder — updated on close
        market.setStartingDate(startingDate);
        market.setEndingDate(endingDate);
        market.setStatus("OPEN");
        market.setResult(null);
        market.setPayoutProcessed(false);
        market.setMarketType(marketType);

        Market saved = marketRepository.save(market);

        System.out.println("[MarketScheduler] Opened market #" + saved.getId()
                + " | price=" + startingPrice
                + " window=" + startingDate + " → " + endingDate);
    }
}
