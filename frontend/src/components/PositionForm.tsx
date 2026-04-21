import type { PositionSide } from "../types/market";

type Props = {
  selectedPosition: PositionSide | null;
  onSelect: (side: PositionSide) => void;
  disabled?: boolean;
};

export function PositionForm({
  selectedPosition,
  onSelect,
  disabled = false,
}: Props) {
  return (
    <div className="mt-6 flex gap-3">
      <button
        type="button"
        onClick={() => onSelect("UP")}
        disabled={disabled}
        className={`
          flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition
          ${
            selectedPosition === "UP"
              ? "bg-linear-to-r from-green-500 to-green-600 text-white shadow-lg"
              : "bg-success-soft text-success"
          }
          ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:opacity-90 active:scale-[0.98]"
          }
        `}
      >
        YES
      </button>

      <button
        type="button"
        onClick={() => onSelect("DOWN")}
        disabled={disabled}
        className={`
          flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition
          ${
            selectedPosition === "DOWN"
              ? "bg-linear-to-r from-red-500 to-red-600 text-white shadow-lg"
              : "bg-danger-soft text-danger"
          }
          ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:opacity-90 active:scale-[0.98]"
          }
        `}
      >
        NO
      </button>
    </div>
  );
}
