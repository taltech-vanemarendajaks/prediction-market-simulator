package com.pms.backend.model;

import java.time.LocalDateTime;

/**
 * MarketType - defines the type of market supported by the system.
 *
 * Fields based on architecture diagram:
 *   - ticker:      trading pair symbol (e.g. BTCUSDT)
 *   - api:         external API source identifier (e.g. "bybit")
 *   - enabled:     whether this market type is active
 *   - createDate:  when this market type was registered
 *
 * MVP scope: only BTC 5-minute UP/DOWN market type is active.
 */
public class MarketType {

    private Long id;
    private String ticker;
    private String api;
    private boolean enabled;
    private LocalDateTime createDate;

    public MarketType() {}

    public MarketType(Long id, String ticker, String api, boolean enabled, LocalDateTime createDate) {
        this.id = id;
        this.ticker = ticker;
        this.api = api;
        this.enabled = enabled;
        this.createDate = createDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public String getApi() { return api; }
    public void setApi(String api) { this.api = api; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public LocalDateTime getCreateDate() { return createDate; }
    public void setCreateDate(LocalDateTime createDate) { this.createDate = createDate; }
}