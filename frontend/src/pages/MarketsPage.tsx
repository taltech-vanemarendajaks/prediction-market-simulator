import { useEffect, useState } from "react";
import { MarketCard } from "../components/MarketCard";
import { fetchMarkets } from "../api/markets";
import type { Market } from "../types/market";

export function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMarkets() {
      try {
        const data = await fetchMarkets();
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
    return <p className="text-slate-600">Loading markets...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <section className="py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Markets</h2>
        <p className="mt-2 text-sm text-slate-600">
          Browse active prediction markets.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {markets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </section>
  );
}
