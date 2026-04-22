# Architecture

## Overview

Prediction Market Simulator is an MVP backend + frontend system where authenticated users place UP/DOWN positions on a single BTC 5-minute market, using wallet balance instead of direct cash flow.

The system creates and closes markets automatically on a 5-minute scheduler, resolves outcomes from BTC price movement, updates position results, and pays out winners.

Current implementation is still MVP-level, but now includes:
- session-based authentication
- starter wallet claim
- wallet-based betting
- automatic payout on market resolution

---

## Core Flow (E2E)

POST /auth/register  
--> POST /auth/login  
--> GET /auth/me  
--> POST /wallet/claim  
--> GET /markets  
--> User selects position (UP/DOWN)  
--> POST /position  
--> Wallet balance deducted  
--> Market expires  
--> Scheduler closes market  
--> Positions updated (WIN / LOSS)  
--> Winner payouts processed  
--> GET /positions/me  
--> GET /auth/me

---

## System Components

### Backend (Spring Boot)

#### Controllers
- `AuthController`
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
  - `POST /auth/logout`
- `WalletController`
  - `POST /wallet/claim`
- `MarketController`
  - `GET /markets`
  - `POST /position`
  - `GET /positions/me`
  - `GET /resolve`

#### Services
- `AuthService`
  - Registers users
  - Authenticates users
  - Loads and saves users
- `BybitApiService`
  - Fetches live BTC price
- `PositionService`
  - Creates positions transactionally
  - Resolves positions in batch
  - Processes winner payouts
- `MarketScheduler`
  - Runs every 5 minutes
  - Closes current market
  - Determines result from price movement
  - Resolves positions
  - Processes payouts once
  - Opens next market
- `MarketService` (partially used)
  - Handles market and market type persistence

#### Repositories (JPA)
- `UserRepository`
- `MarketRepository`
- `PositionRepository`
- `MarketTypeRepository`

#### Data Models
- `User`
- `Market`
- `Position`
- `MarketType`

---

### Frontend (React + Vite + Tailwind)

#### Pages
- `MarketsPage`
  - Loads market from API
  - Displays current market state

#### Components
- `MarketCard`
  - Displays market details and probabilities

#### API Layer
- `markets.ts`
  - Fetches market data from backend

Current frontend scope is still limited and not yet fully integrated with:
- auth flow
- wallet claim flow
- authenticated position creation
- user position history

---

## Data Flow

### Market Lifecycle
Bybit API  
--> `MarketScheduler`  
--> open / close market in DB  
--> `GET /markets` for frontend display

### Authentication
Frontend / client  
--> `AuthController`  
--> `AuthService`  
--> session created with `USER_ID`

### Wallet
Frontend / client  
--> `WalletController`  
--> `AuthService` / `UserRepository`  
--> user balance updated

### Position Creation
Frontend / client  
--> `POST /position`  
--> session user resolved  
--> `PositionService.createPositionForUser(...)`  
--> validate market + balance  
--> deduct wallet balance  
--> save position

### Resolution & Payout
`MarketScheduler`  
--> close current market  
--> determine `UP` / `DOWN` result  
--> `PositionService.resolveMarketAndProcessPayouts(...)`  
--> mark positions `WIN` / `LOSS`  
--> pay winners  
--> mark market `payoutProcessed = true`

---

## Current Behavior

- Single BTC market active at a time
- New market opens every 5 minutes
- Current open market is returned through `GET /markets`
- Live price fetched from Bybit
- Users must register and log in before authenticated actions
- Starter wallet claim gives one-time 500 balance
- Position placement deducts user balance immediately
- Position ownership always comes from authenticated session user
- Market resolution is scheduler-driven, not manual
- Resolution updates all positions in batch:
  - matching side --> `WIN`
  - opposite side --> `LOSS`
- Winning positions receive `2x amount`
- Payout is protected by `payoutProcessed` so same market is not paid twice
- Market status transitions:
  - `OPEN --> CLOSED`

---

## Scope

### In Scope (Current MVP)
- Session-based authentication
- Starter wallet claim
- Market display
- Position creation
- Authenticated user position history
- Automatic market resolution
- Automatic payout on win
- Basic probability display
- End-to-end backend flow from register to payout

### Out of Scope
- Wallet transaction history
- Withdrawals / deposits
- Blockchain integration
- Multiple market categories
- Dynamic probability engine
- Admin panel
- Manual resolve endpoint
- Historical analytics
- Real-time push updates

---

## Known Gaps

- `/markets` returns latest market as single-item list, not full list API
- Frontend is not yet fully connected to auth + wallet flow
- No wallet transaction/audit table yet
- No admin/manual resolve endpoint for fast debug
- No duplicate-position rules per market/user
- No role-based authorization
- No OpenAPI / Swagger documentation generation
- Current payout model is fixed MVP logic (`2x amount`), not odds-based
- Existing old markets created before payout feature may not reflect payout history cleanly

---

## Security Model

- Authentication uses server-side `HttpSession`
- Session stores authenticated `USER_ID`
- `POST /position` does not trust client-provided `userId`
- Wallet claim is limited to one-time use by `starterClaimed`
- Position creation validates:
  - authenticated session
  - existing market
  - market is `OPEN`
  - valid direction
  - positive amount
  - sufficient wallet balance
- Payout execution is guarded by `payoutProcessed`

---

## Persistence

### Database
- PostgreSQL for dev/runtime
- H2 for automated tests

### Persisted Entities
- `User`
  - identity, credentials, balance, starter claim state
- `Market`
  - lifecycle, prices, result, payout guard
- `Position`
  - user stake, direction, result
- `MarketType`
  - seeded BTC market type

---

## Testing Status

Current backend tests cover:
- authenticated user cannot spoof position ownership
- authenticated user can read own positions
- unauthenticated user cannot create position
- unauthenticated user cannot read own positions
- winning position gets paid out only once

Manual smoke testing has also confirmed:
- register/login flow
- starter wallet claim
- balance deduction on bet
- loss path
- win path
- payout path
- payout-once guard

---

## Future Architecture Direction

- Add wallet transaction ledger
- Add `GET /wallet/transactions`
- Fully connect frontend to auth + wallet flow
- Add manual/admin resolve endpoint for dev/debug
- Add role-based protection for admin actions
- Replace latest-market array response with proper DB-backed market API
- Add market detail endpoint
- Support multiple concurrent markets
- Introduce real probability engine
- Add real-time updates via polling or WebSocket
- Add OpenAPI / Swagger