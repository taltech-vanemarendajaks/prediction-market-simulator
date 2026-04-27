import { useState } from "react";
import { login, register, type AuthUser } from "../api/auth";

type Props = {
  onAuthenticated: (user: AuthUser) => void;
};

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
};

const PASSWORD_ERROR =
  "Password must be at least 8 characters and include one uppercase letter and one symbol.";

function isValidPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthPanel({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setErrors({});
    setSuccessMessage(null);

    const newErrors: FieldErrors = {};

    if (mode === "register" && !name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (mode === "register" && !isValidPassword(password)) {
      newErrors.password = PASSWORD_ERROR;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
      setErrors({
        form: err instanceof Error ? err.message : "Authentication failed",
      });
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

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {mode === "register" && (
          <div>
            <label className="text-sm text-text-secondary">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`mt-1 w-full rounded-xl border bg-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:ring-1 ${
                errors.name
                  ? "border-danger focus:border-danger focus:ring-danger/30"
                  : "border-border focus:border-blue-500 focus:ring-blue-500/30"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-danger">{errors.name}</p>
            )}
          </div>
        )}

        <div>
          <label className="text-sm text-text-secondary">Email</label>
          <input
            type="text"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`mt-1 w-full rounded-xl border bg-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:ring-1 ${
              errors.email
                ? "border-danger focus:border-danger focus:ring-danger/30"
                : "border-border focus:border-blue-500 focus:ring-blue-500/30"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="text-sm text-text-secondary">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`mt-1 w-full rounded-xl border bg-bg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:ring-1 ${
              errors.password
                ? "border-danger focus:border-danger focus:ring-danger/30"
                : "border-border focus:border-blue-500 focus:ring-blue-500/30"
            }`}
          />

          {mode === "register" && !errors.password && (
            <p className="mt-1 text-xs text-text-secondary">{PASSWORD_ERROR}</p>
          )}

          {errors.password && (
            <p className="mt-1 text-xs text-danger">{errors.password}</p>
          )}
        </div>

        {errors.form && <p className="text-sm text-danger">{errors.form}</p>}

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
          setErrors({});
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
            <span className="font-semibold text-blue-400">Log in</span>
          </>
        )}
      </button>
    </section>
  );
}
