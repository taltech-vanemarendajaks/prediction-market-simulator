import { useEffect, useState } from "react";
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
  onUserUpdated: (user: AuthUser) => void;
};

function getDisplayLabel(side: PositionSide): "YES" | "NO" {
  return side === "UP" ? "YES" : "NO";
}

function getAmountColorClass(side: PositionSide): string {
  return side === "UP" ? "text-success" : "text-danger";
}

function buildSmoothPath(points: string[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point}`;

    const [previousX, previousY] = points[index - 1].split(",").map(Number);
    const [currentX, currentY] = point.split(",").map(Number);
    const midX = (previousX + currentX) / 2;

    return `${path} C ${midX},${previousY} ${midX},${currentY} ${currentX},${currentY}`;
  }, "");
}

function clampChartY(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function MarketDetailPage({
  market,
  onMarketExpired,
  onPositionSubmitted,
  user,
  onAuthenticated,
  onUserUpdated,
}: Props) {
  const [amount, setAmount] = useState(10);
  const [selectedPosition, setSelectedPosition] = useState<PositionSide | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);

  useEffect(() => {
    setPriceHistory((current) => {
      const next = [...current, market.endingPrice];
      return next.slice(-30);
    });
  }, [market.endingPrice]);

  const minPrice = Math.min(...priceHistory);
  const maxPrice = Math.max(...priceHistory);
  const priceRange = maxPrice - minPrice || 1;

  const chartPoints = priceHistory
    .map((price, index) => {
      const x =
        priceHistory.length === 1
          ? 0
          : (index / (priceHistory.length - 1)) * 100;
      const y = clampChartY(100 - ((price - minPrice) / priceRange) * 100);

      return `${x},${y}`;
    })

  const chartPath = buildSmoothPath(chartPoints);
  const areaPath =
    chartPoints.length > 1
      ? `${chartPath} L 100,100 L 0,100 Z`
      : "";
  const currentPoint = chartPoints.at(-1);
  const [currentX, currentY] = currentPoint
    ? currentPoint.split(",").map(Number)
    : [0, 0];
  async function handleSelect(side: PositionSide) {
    setSubmitError(null);

    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setSubmitError("Amount must be greater than 0");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await submitPosition({
        marketId: market.id,
        userId: user.id,
        positionType: side,
        amount,
      });

      onUserUpdated({
        ...user,
        balance: result.balance,
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

          {priceHistory.length > 1 && (
            <div className="mt-6 rounded-xl border border-border bg-bg p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">
                  Live Price
                </p>
                <p className="text-xs text-text-secondary">
                  Last {priceHistory.length} updates
                </p>
              </div>

              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-44 w-full overflow-hidden"
              >
                <defs>
                  <linearGradient id="priceArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[20, 50, 80].map((lineY) => (
                  <line
                    key={lineY}
                    x1="0"
                    x2="100"
                    y1={lineY}
                    y2={lineY}
                    stroke="currentColor"
                    strokeWidth="0.35"
                    className="text-border"
                  />
                ))}

                <path
                  d={areaPath}
                  fill="url(#priceArea)"
                  className="text-success"
                />

                <path
                  d={chartPath}
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                  className="text-success"
                />

                <circle
                  cx={currentX}
                  cy={currentY}
                  r="1.6"
                  fill="currentColor"
                  className="text-success"
                />
              </svg>

              <div className="mt-2 flex justify-between text-xs text-text-secondary">
                <span>${minPrice.toFixed(2)}</span>
                <span>${maxPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <PositionForm
            selectedPosition={selectedPosition}
            onSelect={handleSelect}
            amount={amount}
            onAmountChange={setAmount}            
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
              Selected position:{" "}
              <span className={getAmountColorClass(selectedPosition)}>
                {getDisplayLabel(selectedPosition)} ${amount}
              </span>
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
