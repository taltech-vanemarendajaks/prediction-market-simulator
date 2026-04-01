package com.pms.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * BybitApiService - fetches live BTC price data from Bybit public API.
 *
 * Endpoints used:
 *   GET /v5/market/tickers?category=spot&symbol=BTCUSDT
 *
 * To use real API key (private endpoints), set in application.properties:
 *   bybit.api.key=YOUR_API_KEY_HERE
 *   bybit.api.secret=YOUR_API_SECRET_HERE
 *
 * For MVP, only public endpoints are used — no API key required.
 */
@Service
public class BybitApiService {

    private static final String BYBIT_BASE_URL = "https://api.bybit.com";
    private static final String SYMBOL = "BTCUSDT";

    // Add your API key to application.properties if needed for private endpoints
    @Value("${bybit.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public BybitApiService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * market_pair(BTC) - Returns the trading pair symbol used for this market.
     * Currently fixed to BTCUSDT as per MVP scope.
     */
    public String marketPair() {
        return SYMBOL;
    }

    /**
     * market_orders(price) - Fetches the current last traded price for BTCUSDT.
     * Uses Bybit public spot ticker endpoint.
     *
     * @return current BTC price as Double, or null if fetch fails
     */
    public Double marketOrderPrice() {
        try {
            String url = BYBIT_BASE_URL + "/v5/market/tickers?category=spot&symbol=" + SYMBOL;
            BybitTickerResponse response = restTemplate.getForObject(url, BybitTickerResponse.class);

            if (response != null
                    && response.getResult() != null
                    && response.getResult().getList() != null
                    && !response.getResult().getList().isEmpty()) {

                String lastPrice = response.getResult().getList().get(0).getLastPrice();
                return Double.parseDouble(lastPrice);
            }
        } catch (Exception e) {
            // Log and return null — caller handles fallback
            System.err.println("BybitApiService: Failed to fetch BTC price: " + e.getMessage());
        }
        return null;
    }

    // --- Inner classes for JSON mapping ---

    static class BybitTickerResponse {
        private int retCode;
        private String retMsg;
        private Result result;

        public int getRetCode() { return retCode; }
        public void setRetCode(int retCode) { this.retCode = retCode; }
        public String getRetMsg() { return retMsg; }
        public void setRetMsg(String retMsg) { this.retMsg = retMsg; }
        public Result getResult() { return result; }
        public void setResult(Result result) { this.result = result; }

        static class Result {
            private java.util.List<Ticker> list;

            public java.util.List<Ticker> getList() { return list; }
            public void setList(java.util.List<Ticker> list) { this.list = list; }
        }

        static class Ticker {
            private String symbol;
            private String lastPrice;

            public String getSymbol() { return symbol; }
            public void setSymbol(String symbol) { this.symbol = symbol; }
            public String getLastPrice() { return lastPrice; }
            public void setLastPrice(String lastPrice) { this.lastPrice = lastPrice; }
        }
    }
}