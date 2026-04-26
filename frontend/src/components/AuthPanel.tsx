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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const user =
        mode === "login"
          ? await login({ email, password })
          : await register({ name, email, password });

      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 text-text-primary">
      <h2 className="text-2xl font-bold">
        {mode === "login" ? "Login" : "Create account"}
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" && (
          <div>
            <label className="text-sm text-text-secondary">Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-borderHover"
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
            className="mt-1 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-borderHover"
            required
          />
        </div>

        <div>
          <label className="text-sm text-text-secondary">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-borderHover"
            required
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setError(null);
          setMode(mode === "login" ? "register" : "login");
        }}
        className="mt-4 cursor-pointer text-sm text-text-secondary hover:underline"
      >
        {mode === "login"
          ? "No account? Register"
          : "Already have an account? Login"}
      </button>
    </section>
  );
}
