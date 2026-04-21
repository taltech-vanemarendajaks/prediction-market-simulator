import type { PositionSide } from "../types/market";

type ResultPanelProps = {
  result: PositionSide | null;
  selectedPosition: PositionSide | null;
};

function getDisplayLabel(side: PositionSide): "YES" | "NO" {
  return side === "UP" ? "YES" : "NO";
}

export function ResultPanel({ result, selectedPosition }: ResultPanelProps) {
  if (!result) return null;

  const userWon = selectedPosition === result;

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm text-text-secondary">Result</p>

      <p className="mt-2 text-lg font-semibold text-text-primary">
        Market resolved: {getDisplayLabel(result)}
      </p>

      {selectedPosition && (
        <p
          className={`mt-2 text-sm ${userWon ? "text-success" : "text-danger"}`}
        >
          {userWon ? "You predicted correctly" : "Your prediction was wrong"}
        </p>
      )}
    </div>
  );
}
