import { useState } from "react";
import { login, register, type AuthUser } from "../api/auth";

type Props = {
  onAuthenticated: (user: AuthUser) => void;
};

export function AuthPanel({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      setLoading(true);

      if (mode === "login") {
        const user = await login({ email, password });
        onAuthenticated(user);
        return;
      }

      await register({ name, email, password });
      setSuccessMessage("Account created successfully. You can now log in.");
      setMode("login");
      setName("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 text-text-primary">
      <h3 className="text-xl font-semibold">
        {mode === "login"
          ? "Welcome back! Log in to continue"
          : "Create an account to start trading"}
      </h3>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" && (
          <div>
            <label className="text-sm text-text-secondary">Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text-primary outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              required
            />
          </div>
        )}

        <div>
          <label className="text-sm text-text-secondary">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text-primary outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            required
          />
        </div>

        <div>
          <label className="text-sm text-text-secondary">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text-primary outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            required
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {successMessage && (
          <p className="text-sm text-green-500">{successMessage}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:from-blue-400 hover:to-blue-500 hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Log in"
              : "Register"}

          {!loading && <span className="text-lg">→</span>}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-secondary">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={() => {
          setError(null);
          setSuccessMessage(null);
          setMode(mode === "login" ? "register" : "login");
        }}
        className="mt-4 w-full cursor-pointer text-center text-sm text-text-secondary transition hover:text-blue-400"
      >
        {mode === "login" ? (
          <>
            No account?{" "}
            <span className="font-semibold text-blue-400">Register</span>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <span className="font-semibold text-blue-400">Login</span>
          </>
        )}
      </button>
    </section>
  );
}
