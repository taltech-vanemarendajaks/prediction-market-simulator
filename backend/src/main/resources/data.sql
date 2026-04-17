-- Seed a default MarketType for BTCUSDT (required by MarketScheduler)
INSERT INTO market_types (id, ticker, api, enabled, create_date)
VALUES (1, 'BTCUSDT', 'bybit', true, NOW())
ON CONFLICT (id) DO NOTHING;
