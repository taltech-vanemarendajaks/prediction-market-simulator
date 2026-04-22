# Prediction Market Simulator

A web application that simulates a binary BTC prediction market where authenticated users place UP/DOWN positions using wallet balance, and markets resolve automatically based on price movement.

---

## Overview

This project models the core mechanics of a prediction market MVP:

- Users register and log in with session-based authentication
- Users claim starter wallet balance
- Users place UP / DOWN positions on a BTC 5-minute market
- Market resolves automatically on scheduler tick
- Positions become WIN / LOSS
- Winners receive wallet payout

Scope is intentionally limited to simulation only (no real money).

---

## Core Flow

Register --> Login --> Claim --> Market --> Position --> Resolution --> Payout --> Result

---

## Features (Current MVP)

- Session-based authentication
- One-time starter wallet claim (`500`)
- Single BTC 5-minute prediction market
- Place UP / DOWN positions
- Deduct wallet balance on bet placement
- Resolve market automatically every 5 minutes
- Batch update position results (`WIN / LOSS`)
- Pay winners automatically (`2x amount`)
- Prevent double payout with payout guard
- Frontend market list view connected to backend

---

## Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL
- H2 (tests)
- REST API

### Frontend
- React
- TypeScript
- Vite

### Infrastructure
- Docker (PostgreSQL)
- GitHub Actions CI

---

## API Endpoints

Base URL:  
`http://localhost:8080/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

### Wallet
- `POST /wallet/claim`

### Market / Positions
- `GET /markets`
- `POST /position`
- `GET /positions/me`
- `GET /resolve`

Full API docs:  
`docs/api.md`

---

## Project Structure

```text
.
├── backend
│   ├── src/main/java/com/pms/backend
│   │   ├── config
│   │   ├── controller
│   │   ├── dto
│   │   ├── model
│   │   ├── repository
│   │   └── service
│   ├── src/main/resources
│   └── src/test
│
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── pages
│   │   └── types
│
├── docs
│   ├── api.md
│   ├── architecture.md
│   ├── decision-log.md
│   ├── deploy.md
│   └── team-process.md
│
├── .github
│   ├── workflows
│   └── ISSUE_TEMPLATE
│
├── docker-compose.yml
└── README.md
````

---

## Backend Architecture

Controller --> Service --> Repository --> Database

### Main backend components

#### Controllers

* `AuthController`
* `WalletController`
* `MarketController`

#### Services

* `AuthService`
* `BybitApiService`
* `MarketScheduler`
* `MarketService`
* `OddsService`
* `PositionService`

#### Models

* `User`
* `Market`
* `Position`
* `MarketType`

---

## Market Lifecycle

The market is scheduler-driven.

Every 5 minutes:

1. current OPEN market is closed
2. closing BTC price is fetched
3. market result is determined (`UP` / `DOWN`)
4. positions are updated (`WIN` / `LOSS`)
5. winner payouts are processed once
6. next market is opened

---

## Wallet Rules

* New users start with `0`
* Authenticated user can claim starter balance once
* Starter claim amount = `500`
* Bet amount is deducted immediately
* Winning position pays out `2x amount`
* Losing position pays out nothing

Example:

* balance = `500`
* bet = `100`
* balance after bet = `400`
* if WIN -> payout `200`
* final balance = `600`

---

## Running Locally

## 1. Start PostgreSQL

From project root:

```bash
docker compose up -d
```

## 2. Run backend

```bash
cd backend
./mvnw spring-boot:run
```

## 3. Run frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Running Tests

```bash
cd backend
./mvnw test
```

---

## Current Status

Implemented:

* backend auth flow
* wallet claim flow
* transactional position creation
* automatic market resolution
* automatic payout flow
* payout-once protection
* backend tests for core auth/position/payout behavior
* frontend market fetch integration

Current limitations:

* single market only
* no wallet transaction history yet
* no admin/manual resolve endpoint
* no odds-based payout model yet
* frontend not yet fully integrated with auth + wallet flows
* latest market is returned as single-item list
* no Swagger/OpenAPI yet

---

## Next Steps

* Add wallet transaction ledger
* Add `GET /wallet/transactions`
* Connect frontend to auth flow
* Connect frontend to wallet claim and position flow
* Add manual/dev resolve endpoint for faster testing
* Add market detail endpoint
* Add proper market list API
* Add role-based admin protection for future admin actions

---

## Workflow

* issue --> branch --> PR --> review --> merge
* 1 PR = 1 task
* no direct commits to `main`
* CI must pass
* `main` stays stable

---

## Documentation

* API --> `docs/api.md`
* Architecture --> `docs/architecture.md`
* Decisions --> `docs/decision-log.md`
* Deploy --> `docs/deploy.md`
* Team process --> `docs/team-process.md`