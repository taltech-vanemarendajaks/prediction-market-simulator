import { useEffect, useState } from "react";
import { MarketsPage } from "./pages/MarketsPage";
import { fetchMe, logout, type AuthUser } from "./api/auth";
import { AuthModal } from "./components/AuthModal";
import { WalletPanel } from "./components/WalletPanel";

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
            balance: me.balance,
            starterClaimed: me.starterClaimed,            
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

  useEffect(() => {
    if (!user) return;

    const interval = window.setInterval(async () => {
      try {
        const me = await fetchMe();

        if (!me) {
          setUser(null);
          return;
        }

        setUser((currentUser) => {
          if (!currentUser) return null;

          return {
            ...currentUser,
            balance: me.balance,
            starterClaimed: me.starterClaimed,
          };
        });
      } catch (error) {
        console.error(error);
      }
    }, 3000);

    return () => window.clearInterval(interval);
  }, [user]);

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

        {user && <WalletPanel user={user} onUserUpdated={setUser} />}

        <MarketsPage
          user={user}
          onAuthenticated={setUser}
          onUserUpdated={setUser}
        />
      </div>
      {showAuth && (
        <AuthModal
          onAuthenticated={(user) => {
            setUser(user);
            setShowAuth(false);
          }}
          onClose={() => setShowAuth(false)}
        />
      )}
    </main>
  );
}

export default App;
