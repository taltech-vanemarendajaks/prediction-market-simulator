import { FaBitcoin } from "react-icons/fa";
import type { Market } from "../types/market";

type MarketCardProps = {
  market: Market;
};

export function MarketCard({ market }: MarketCardProps) {
  const noProbability = 100 - market.probability;

  return (
    <article className="cursor-pointer rounded-2xl border border-border bg-surface p-6 text-text-primary shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-borderHover hover:bg-surface hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#F7931A] text-white">
            <FaBitcoin className="text-3xl" />
          </div>

          <div>
            <h3 className="text-lg font-semibold">{market.title}</h3>
            <p className="mt-0.5 text-sm text-text-secondary">
              {market.description}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            market.status === "OPEN"
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger"
          }`}
        >
          {market.status}
        </span>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-bg p-3">
          <p className="text-xs text-text-secondary">Start Price</p>
          <p className="mt-1 text-sm font-semibold">
            ${market.startPrice.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl bg-bg p-3">
          <p className="text-xs text-text-secondary">Current Price</p>
          <p className="mt-1 text-sm font-semibold">
            ${(market.endingPrice ?? market.startPrice).toFixed(2)}
          </p>
        </div>
      </div>
      <div className="mb-6 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-success">YES</span>
            <span className="text-text-secondary">{market.probability}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-hover">
            <div
              className="h-2 rounded-full bg-success"
              style={{ width: `${market.probability}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-danger">NO</span>
            <span className="text-text-secondary">{noProbability}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-hover">
            <div
              className="h-2 rounded-full bg-danger"
              style={{ width: `${noProbability}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
