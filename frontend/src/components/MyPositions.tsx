import { useEffect, useState } from "react";
import { fetchMyPositions, type MyPosition } from "../api/position";

type Props = {
  refreshKey?: number;
};

function getDisplaySide(side: MyPosition["positionType"]): "YES" | "NO" {
  return side === "UP" ? "YES" : "NO";
}

function getResultClass(result: MyPosition["positionResult"]) {
  if (result === "WIN") return "bg-success-soft text-success";
  if (result === "LOSS") return "bg-danger-soft text-danger";
  return "bg-bg text-text-secondary";
}

export function MyPositions({ refreshKey }: Props) {
  const [positions, setPositions] = useState<MyPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPositions() {
    try {
      setError(null);
      const data = await fetchMyPositions();
      setPositions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load positions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPositions();
  }, [refreshKey]);

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-text-secondary">Loading positions...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-danger">{error}</p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">My Positions</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Your submitted market positions.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPositions}
          className="cursor-pointer rounded-xl border border-border px-3 py-2 text-sm text-text-secondary transition hover:bg-bg"
        >
          Refresh
        </button>
      </div>

      {positions.length === 0 ? (
        <p className="text-sm text-text-secondary">
          You do not have any positions yet.
        </p>
      ) : (
        <div className="space-y-3">
          {positions.map((position) => (
            <div
              key={position.positionId}
              className="rounded-xl bg-bg p-4 text-sm text-text-primary"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{position.marketTitle}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {new Date(position.createdAt).toLocaleString()}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getResultClass(
                    position.positionResult,
                  )}`}
                >
                  {position.positionResult}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-text-secondary">Position</p>
                  <p className="mt-1 font-semibold">
                    {getDisplaySide(position.positionType)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-secondary">Amount</p>
                  <p className="mt-1 font-semibold">{position.amount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
