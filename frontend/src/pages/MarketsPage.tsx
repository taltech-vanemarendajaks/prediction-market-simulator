import { useEffect, useState } from "react";
import { fetchMarkets } from "../api/markets";
import type { Market } from "../types/market";
import { MarketDetailPage } from "./MarketDetailPage";

export function MarketsPage() {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // force re-render every second (for countdown)
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadMarket() {
      try {
        const data = await fetchMarkets();

        if (!data || data.length === 0) {
          throw new Error("No market found");
        }

        setMarket(data[0]);
      } catch (err) {
        setError("Failed to load market");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMarket();
  }, []);

  if (loading) {
    return <p className="text-text-secondary">Loading market...</p>;
  }

  if (error || !market) {
    return <p className="text-danger">{error ?? "No market available"}</p>;
  }

  return <MarketDetailPage market={market} />;
}
