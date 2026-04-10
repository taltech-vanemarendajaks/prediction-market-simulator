# Architecture

## Overview

Prediction Market Simulator where users take YES/NO positions on a BTC market and the system resolves outcomes based on price movement.

Current implementation is MVP-level with a single BTC 5-minute market.

---

## Core Flow (E2E)

GET /markets  
--> User selects position (YES/NO)  
--> POST /position  
--> Market expires  
--> POST /resolve  
--> Positions updated (WIN / LOSS)  
--> Market closed

---

## System Components

### Backend (Spring Boot)

#### Controllers
- `MarketController`
  - GET /markets
  - POST /position
  - POST /resolve

#### Services
- `BybitApiService`
  - Fetches live BTC price
- `PositionService`
  - Creates positions
  - Resolves positions in batch (WIN / LOSS)
- `MarketService` (partially used)
  - Handles market and market type persistence

#### Repositories (JPA)
- `MarketRepository`
- `PositionRepository`
- `MarketTypeRepository`

#### Data Models
- `Market`
- `Position`
- `MarketType`

---

### Frontend (React + Vite + Tailwind)

#### Pages
- `MarketsPage`
  - Loads market from API
  - Passes data to detail view
- `MarketDetailPage`
  - Main interaction screen

#### Components
- `PositionForm`
  - YES / NO selection
- `CountdownTimer`
  - Tracks market expiration
- `ResultPanel`
  - Displays outcome

#### API Layer
- `fetchMarkets()`
  - Maps backend response --> frontend model

---

## Data Flow

Backend:
Bybit API --> MarketController --> FE

User:
FE --> POST /position --> DB

Resolution:
POST /resolve --> PositionService --> DB updates

---

## Current Behavior

- Single BTC market (hardcoded response for FE contract)
- Live price fetched from Bybit
- Positions stored in PostgreSQL
- Resolution updates all positions in batch:
  - correct --> WIN
  - incorrect --> LOSS
- Market status transitions:
  - OPEN --> CLOSED

---

## Scope

### In Scope (MVP)
- Market display
- Position creation
- Market resolution
- Basic probability display (static 50/50)
- End-to-end backend flow

### Out of Scope
- Authentication / users
- Wallet / real money
- Blockchain integration
- Multiple markets
- Dynamic probability engine
- Admin panel
- Historical analytics

---

## Known Gaps

- `/markets` is not DB-driven (hardcoded response)
- FE uses simulated price movement
- No protection on `/resolve`
- No persistence-driven probability calculation
- No validation for duplicate positions per user

---

## Future Architecture Direction

- Replace hardcoded market with DB-backed markets
- Introduce ProbabilityEngine (real calculation)
- Add auth layer (users + sessions)
- Add admin-only market resolution
- Connect FE fully to backend (remove simulation)
- Add multiple concurrent markets
- Add real-time updates (WebSocket or polling)