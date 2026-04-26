import { useEffect, useState } from "react";
import { fetchMarkets } from "../api/markets";
import type { Market } from "../types/market";
import { MarketCard } from "../components/MarketCard";
import { MarketDetailPage } from "./MarketDetailPage";
import { MyPositions } from "../components/MyPositions";
import type { AuthUser } from "../api/auth";

type Props = {
  user: AuthUser | null;
  onAuthenticated: (user: AuthUser) => void;
};

export function MarketsPage({ user, onAuthenticated }: Props) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [positionsRefreshKey, setPositionsRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refreshPositions() {
    setPositionsRefreshKey((current) => current + 1);
  }

  async function loadMarkets() {
    try {
      setError(null);

      const data = await fetchMarkets();

      if (!data || data.length === 0) {
        throw new Error("No market found");
      }

      setMarkets(data);

      setSelectedMarket((currentSelectedMarket) => {
        if (!currentSelectedMarket) return null;

        const updated = data.find((m) => m.id === currentSelectedMarket.id);

        return updated ?? data[0];
      });
    } catch (err) {
      setError("Failed to load markets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarkets();

    const interval = window.setInterval(() => {
      loadMarkets();
    }, 3000);

    return () => window.clearInterval(interval);
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
          type="button"
          onClick={() => setSelectedMarket(null)}
          className="mb-4 cursor-pointer text-sm text-text-secondary hover:underline"
        >
          ← Back
        </button>

        <MarketDetailPage
          market={selectedMarket}
          onMarketExpired={loadMarkets}
          onPositionSubmitted={refreshPositions}
          user={user}
          onAuthenticated={onAuthenticated}
        />
      </div>
    );
  }

  return (
    <section className="py-6">
      <h2 className="mb-6 text-2xl font-bold">Markets</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {markets.map((market) => (
          <div
            key={market.id}
            onClick={() => setSelectedMarket(market)}
            className="cursor-pointer"
          >
            <MarketCard market={market} />
          </div>
        ))}
      </div>

      {user && <MyPositions refreshKey={positionsRefreshKey} />}
    </section>
  );
}
