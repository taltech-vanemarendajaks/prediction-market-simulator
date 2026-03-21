# Frontend – Prediction Market Simulator

React + Vite + Tailwind frontend for the prediction market simulator.

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

> Backend is expected to run on port 8080.

### 3. Start development server

```bash
npm run dev
```

App will be available at:

```
http://localhost:5173
```

---

## 🧱 Project Structure

```
src/
  api/           # API calls (e.g. fetchMarkets)
  components/    # Reusable UI components
  pages/         # Page-level components
  types/         # TypeScript types
```

---

## 🔌 API Integration

Frontend expects backend endpoint:

```
GET /markets
```

Base URL is configured via:

```
import.meta.env.VITE_API_BASE_URL
```

Example:

```
http://localhost:8080/markets
```

---

## 🛠 Tech Stack

- React
- Vite
- TypeScript
- Tailwind CSS

---

## 🧪 Build

```bash
npm run build
```

---

## ⚠️ Notes

- `.env` is ignored by git
- use `.env.example` as a template
- backend must be running for API calls to work

---

## 📌 Status

Frontend initial setup complete:

- ✅ Local dev working
- ✅ Tailwind configured
- ✅ Markets page implemented
- ✅ API layer ready for integration

---

## 🧑‍💻 Development Notes

- Backend is implemented in Spring Boot
- Expected next step: connect `/markets` endpoint
