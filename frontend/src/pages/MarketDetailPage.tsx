import { useState } from "react";
import type { Market, PositionSide } from "../types/market";
import { CountdownTimer } from "../components/CountdownTimer";
import { PositionForm } from "../components/PositionForm";
import { ResultPanel } from "../components/ResultPanel";
import { FaBitcoin } from "react-icons/fa";

type Props = {
  market: Market;
};

function getDisplayLabel(side: PositionSide): "YES" | "NO" {
  return side === "UP" ? "YES" : "NO";
}

export function MarketDetailPage({ market }: Props) {
  const [selectedPosition, setSelectedPosition] = useState<PositionSide | null>(
    null,
  );

  return (
    <section className="min-h-screen bg-bg py-10 text-text-primary">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#F7931A] text-white">
                <FaBitcoin className="text-3xl" />
              </div>

              <div>
                <h1 className="text-2xl font-bold leading-tight">
                  {market.title}
                </h1>

                <p className="mt-0.5 text-sm text-text-secondary/80">
                  {market.description}
                </p>
              </div>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                market.status === "OPEN"
                  ? "bg-success-soft text-success"
                  : "bg-danger-soft text-danger"
              }`}
            >
              {market.status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-bg p-4">
              <p className="text-sm text-text-secondary">Start Price</p>
              <p className="mt-1 text-lg font-semibold">
                ${market.startPrice.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl bg-bg p-4">
              <p className="text-sm text-text-secondary">Current Price</p>
              <p className="mt-1 text-lg font-semibold">
                ${(market.endingPrice ?? market.startPrice).toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl bg-bg p-4">
              <p className="text-sm text-text-secondary">Time Left</p>
              <p className="mt-1 text-lg font-semibold">
                {market.status === "OPEN" ? (
                  <CountdownTimer endsAt={market.endsAt} />
                ) : (
                  "00:00"
                )}
              </p>
            </div>
          </div>

          <PositionForm
            selectedPosition={selectedPosition}
            onSelect={setSelectedPosition}
            disabled={market.status !== "OPEN"}
          />

          <p className="mt-3 text-xs text-text-secondary/70">
            Position selection is currently UI-only in the MVP and is not yet
            submitted to the backend.
          </p>

          {selectedPosition && (
            <p className="mt-2 text-sm text-text-secondary">
              Selected position: {getDisplayLabel(selectedPosition)}
            </p>
          )}

          <ResultPanel
            result={market.result}
            selectedPosition={selectedPosition}
          />
        </div>
      </div>
    </section>
  );
}
