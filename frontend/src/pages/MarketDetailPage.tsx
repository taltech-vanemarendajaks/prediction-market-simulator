import { useState } from "react";
import type { Market, PositionSide } from "../types/market";
import { CountdownTimer } from "../components/CountdownTimer";
import { PositionForm } from "../components/PositionForm";
import { ResultPanel } from "../components/ResultPanel";
import { FaBitcoin } from "react-icons/fa";
import { submitPosition } from "../api/position";
import type { AuthUser } from "../api/auth";
import { AuthModal } from "../components/AuthModal";

type Props = {
  market: Market;
  onMarketExpired?: () => void;
  onPositionSubmitted?: () => void;
  user: AuthUser | null;
  onAuthenticated: (user: AuthUser) => void;
};

function getDisplayLabel(side: PositionSide): "YES" | "NO" {
  return side === "UP" ? "YES" : "NO";
}

export function MarketDetailPage({
  market,
  onMarketExpired,
  onPositionSubmitted,
  user,
  onAuthenticated,
}: Props) {
  const [selectedPosition, setSelectedPosition] = useState<PositionSide | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  async function handleSelect(side: PositionSide) {
    setSubmitError(null);

    if (!user) {
      setShowAuth(true);
      return;
    }

    try {
      setIsSubmitting(true);

      await submitPosition({
        marketId: market.id,
        positionType: side,
        amount: 10,
      });

      setSelectedPosition(side);
      onPositionSubmitted?.();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit position",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
                ${market.endingPrice.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl bg-bg p-4">
              <p className="text-sm text-text-secondary">Time Left</p>
              <p className="mt-1 text-lg font-semibold">
                {market.status === "OPEN" ? (
                  <CountdownTimer
                    endsAt={market.endsAt}
                    onComplete={onMarketExpired}
                  />
                ) : (
                  "00:00"
                )}
              </p>
            </div>
          </div>

          <PositionForm
            selectedPosition={selectedPosition}
            onSelect={handleSelect}
            disabled={market.status !== "OPEN" || isSubmitting}
          />

          {showAuth && (
            <AuthModal
              onAuthenticated={(user) => {
                onAuthenticated(user);
                setShowAuth(false);
              }}
              onClose={() => setShowAuth(false)}
            />
          )}
          {isSubmitting && (
            <p className="mt-3 text-xs text-text-secondary/70">
              Submitting position...
            </p>
          )}

          {submitError && (
            <p className="mt-3 text-sm text-danger">{submitError}</p>
          )}

          {selectedPosition && !submitError && (
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
