import type { PositionSide } from "../types/market";
import { FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

type ResultPanelProps = {
  result: PositionSide | null;
  selectedPosition: PositionSide | null;
  finalPrice?: number;
  marketTitle?: string;
  showGoToLiveMarket?: boolean;
  onGoToLiveMarket?: () => void;  
};

function getDisplayLabel(side: PositionSide): "Up" | "Down" {
  return side === "UP" ? "Up" : "Down";
}

export function ResultPanel({
  result,
  selectedPosition,
  finalPrice,
  marketTitle,
  showGoToLiveMarket = false,
  onGoToLiveMarket,
}: ResultPanelProps) {
  if (!result) return null;

  const userWon = selectedPosition === result;

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bg md:mx-0">
            {userWon ? (
              <FaCheckCircle className="text-4xl text-success" />
            ) : (
              <FaTimesCircle className="text-4xl text-danger" />
            )}
          </div>

          <p className="mt-5 text-center text-3xl font-semibold text-text-primary md:text-left">
            Outcome: {getDisplayLabel(result)}
          </p>

          {marketTitle && (
            <p className="mt-3 text-center text-sm text-text-secondary md:text-left">
              {marketTitle}
            </p>
          )}

          {typeof finalPrice === "number" && (
            <p className="mt-2 text-center text-sm text-text-secondary md:text-left">
              Final price: ${finalPrice.toFixed(2)}
            </p>
          )}

          {selectedPosition && (
            <p
              className={`mt-4 text-center text-sm font-medium md:text-left ${
                userWon ? "text-success" : "text-danger"
              }`}
            >
              {userWon ? "You won this market." : "You lost this market."}
            </p>
          )}
        </div>

        {showGoToLiveMarket && (
          <button
            type="button"
            onClick={onGoToLiveMarket}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-bg px-5 py-3 text-sm font-semibold text-text-primary transition hover:border-borderHover hover:bg-surface-hover"
          >
            Go to live market
            <FaArrowRight className="text-xs" />
          </button>
        )}
      </div>
    </div>
  );
}
