import { MarketsPage } from "./pages/MarketsPage";

function App() {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Prediction Market Simulator
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            BTC 5-minute prediction market simulation.
          </p>
        </header>

        <MarketsPage />
      </div>
    </main>
  );
}

export default App;
