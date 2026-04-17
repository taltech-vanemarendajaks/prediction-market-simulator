import { useEffect, useMemo, useState } from "react";
import type { Market, MarketStatus, PositionSide } from "../types/market";
import { CountdownTimer } from "../components/CountdownTimer";
import { PositionForm } from "../components/PositionForm";
import { ResultPanel } from "../components/ResultPanel";
import { FaBitcoin } from "react-icons/fa";

type Props = {
  market: Market;
};

function getDerivedStatus(market: Market): MarketStatus {
  if (market.status === "RESOLVED") return "RESOLVED";

  const hasEnded = Date.now() >= new Date(market.endsAt).getTime();
  return hasEnded ? "RESOLVED" : market.status;
}

function getResult(market: Market, status: MarketStatus): "YES" | "NO" | null {
  if (status !== "RESOLVED") return null;

  return market.currentPrice > market.startPrice ? "YES" : "NO";
}

export function MarketDetailPage({ market }: Props) {
  const [selectedPosition, setSelectedPosition] = useState<PositionSide | null>(
    null,
  );
  const [marketState, setMarketState] = useState<Market>(market);

  useEffect(() => {
    setMarketState(market);
  }, [market]);

  useEffect(() => {
    if (marketState.status !== "OPEN") return;

    const interval = window.setInterval(() => {
      const now = Date.now();
      const endsAtTime = new Date(marketState.endsAt).getTime();

      if (now >= endsAtTime) {
        setMarketState((prev) => ({
          ...prev,
          status: "RESOLVED",
        }));
        window.clearInterval(interval);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [marketState.endsAt, marketState.status]);

  const derivedStatus = useMemo(
    () => getDerivedStatus(marketState),
    [marketState],
  );
  const result = useMemo(
    () => getResult(marketState, derivedStatus),
    [marketState, derivedStatus],
  );

  return (
    <section className="min-h-screen bg-bg py-10 text-text-primary">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#F7931A] text-white">
                <FaBitcoin className="text-3xl" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{marketState.title}</h1>
                </div>

                <p className="text-sm text-text-secondary/80">
                  {marketState.description}
                </p>
              </div>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                derivedStatus === "OPEN"
                  ? "bg-success-soft text-success"
                  : "bg-danger-soft text-danger"
              }`}
            >
              {derivedStatus}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-bg p-4">
              <p className="text-sm text-text-secondary">Start Price</p>
              <p className="mt-1 text-lg font-semibold">
                ${marketState.startPrice}
              </p>
            </div>

            <div className="rounded-xl bg-bg p-4">
              <p className="text-sm text-text-secondary">Current Price</p>
              <p className="mt-1 text-lg font-semibold">
                ${marketState.currentPrice}
              </p>
            </div>

            <div className="rounded-xl bg-bg p-4">
              <p className="text-sm text-text-secondary">Time Left</p>
              <p className="mt-1 text-lg font-semibold">
                {derivedStatus === "OPEN" ? (
                  <CountdownTimer endsAt={marketState.endsAt} />
                ) : (
                  "00:00"
                )}
              </p>
            </div>
          </div>

          <PositionForm
            selectedPosition={selectedPosition}
            onSelect={setSelectedPosition}
            disabled={derivedStatus !== "OPEN"}
          />

          <ResultPanel result={result} selectedPosition={selectedPosition} />
        </div>
      </div>
    </section>
  );
}
