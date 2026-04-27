import { useState } from "react";
import type { AuthUser } from "../api/auth";
import { claimStarterCoins } from "../api/wallet";

type Props = {
  user: AuthUser;
  onUserUpdated: (user: AuthUser) => void;
};

export function WalletPanel({ user, onUserUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim() {
    try {
      setLoading(true);
      setError(null);

      const result = await claimStarterCoins();

      onUserUpdated({
        ...user,
        balance: result.balance,
        starterClaimed: result.starterClaimed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim starter coins");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Wallet</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Current balance: <span className="font-semibold text-text-primary">{user.balance}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleClaim}
          disabled={loading || user.starterClaimed}
          className="cursor-pointer rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {user.starterClaimed
            ? "Starter claimed"
            : loading
              ? "Claiming..."
              : "Claim 500"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </section>
  );
}