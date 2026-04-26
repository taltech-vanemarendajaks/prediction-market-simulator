import { useEffect, useState } from "react";
import { MarketsPage } from "./pages/MarketsPage";
import { fetchMe, logout, type AuthUser } from "./api/auth";
import { AuthPanel } from "./components/AuthPanel";

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const me = await fetchMe();

        if (me) {
          setUser({
            id: me.userId,
            name: "",
            email: "",
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCheckingSession(false);
      }
    }

    checkSession();
  }, []);

  async function handleLogout() {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-bg p-8 text-text-primary">
        <p className="text-text-secondary">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Prediction Market Simulator
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              BTC 5-minute prediction market simulation.
            </p>
          </div>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface"
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface"
            >
              Login
            </button>
          )}
        </header>

        <MarketsPage user={user} onAuthenticated={setUser} />
      </div>
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6">
            <AuthPanel
              onAuthenticated={(user) => {
                setUser(user);
                setShowAuth(false);
              }}
            />

            <button
              type="button"
              onClick={() => setShowAuth(false)}
              className="mt-4 text-sm text-text-secondary hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
