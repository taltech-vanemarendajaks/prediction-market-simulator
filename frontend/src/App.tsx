import { MarketsPage } from "./pages/MarketsPage";

function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Prediction Market Simulator
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Frontend initial setup with React and Tailwind.
          </p>
        </header>

        <MarketsPage />
      </div>
    </main>
  );
}

export default App;
