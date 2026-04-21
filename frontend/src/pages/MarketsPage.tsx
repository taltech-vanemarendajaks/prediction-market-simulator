import { useEffect, useState } from "react";
import { fetchMarkets } from "../api/markets";
import type { Market } from "../types/market";
import { MarketCard } from "../components/MarketCard";
import { MarketDetailPage } from "./MarketDetailPage";

export function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMarkets() {
      try {
        const data = await fetchMarkets();

        if (!data || data.length === 0) {
          throw new Error("No market found");
        }

        setMarkets(data);
      } catch (err) {
        setError("Failed to load markets");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMarkets();
  }, []);

  if (loading) {
    return <p className="text-text-secondary">Loading markets...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (selectedMarket) {
    return (
      <div>
        <button
          onClick={() => setSelectedMarket(null)}
          className="cursor-pointer mb-4 text-sm text-text-secondary hover:underline"
        >
          ← Back
        </button>

        <MarketDetailPage market={selectedMarket} />
      </div>
    );
  }

  return (
    <section className="py-6">
      <h2 className="mb-6 text-2xl font-bold">Markets</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {markets.map((market) => (
          <div key={market.id} onClick={() => setSelectedMarket(market)}>
            <MarketCard market={market} />
          </div>
        ))}
      </div>
    </section>
  );
}
