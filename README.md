# Prediction Market Simulator

A web application that simulates a binary prediction market where users take YES/NO positions and markets resolve based on outcome.

---

## Overview

This project models the core mechanics of a prediction market:

- Users take positions (UP / DOWN)
- Market probabilities are displayed
- Market is resolved --> positions become WIN / LOSS

Scope is intentionally limited to simulation (no real money).

---

## Core Flow

Market --> Position --> Resolution --> Result

---

## Features (MVP)

- Single BTC 5-minute prediction market
- Take UP / DOWN positions
- Store positions in database
- Resolve market manually
- Batch update results (WIN / LOSS)
- Frontend market detail view with countdown

---

## Tech Stack

### Backend
- Java
- Spring Boot
- PostgreSQL
- REST API

### Frontend
- React
- TypeScript
- Tailwind CSS

### Infrastructure
- Docker (PostgreSQL)
- CI pipeline (FE + BE)

---

## API Endpoints

Base URL:
http://localhost:8080/api

- GET /markets --> fetch active market
- POST /position --> create position
- POST /resolve --> resolve market

Full API docs:
docs/api.md

---

## Project Structure


.
├── backend/ # Spring Boot API (Java)
│ ├── controller/ # REST endpoints (MarketController)
│ ├── service/ # business logic (BybitApiService, PositionService)
│ ├── model/ # JPA entities (Market, Position, MarketType)
│ ├── repository/ # DB access (Spring Data JPA)
│ └── resources/ # config (application.properties)
│
├── frontend/ # React app (TypeScript + Tailwind)
│ ├── api/ # API layer (fetchMarkets)
│ ├── components/ # UI components (timer, forms, result)
│ ├── pages/ # pages (MarketsPage, MarketDetailPage)
│ └── types/ # TypeScript types
│
├── docs/ # project documentation
│ ├── api.md
│ ├── architecture.md
│ ├── decision-log.md
│ └── team-process.md
│
├── .github/ # CI + templates
│ ├── workflows/ # CI pipeline (FE + BE)
│ └── ISSUE_TEMPLATE/
│
├── docker-compose.yml # local PostgreSQL
└── README.md


---

## Backend Architecture

Controller --> Service --> Repository --> Database

---

## Workflow

- issue --> branch --> PR --> review --> merge
- 1 PR = 1 task (~300–400 LOC)
- no direct commits to main
- CI must pass (FE + BE)
- main branch always stable

---

## Running Locally

### Backend


cd backend
./mvnw spring-boot:run


### Frontend


cd frontend
npm install
npm run dev


---

## Current Status

MVP implemented:

- backend API working
- database persistence working
- market resolution working
- frontend connected to backend

Limitations:

- single market only
- no authentication
- no real probability engine
- frontend partially simulates price movement

---

## Next Steps

- Replace hardcoded market with DB-driven markets
- Connect frontend to POST /position
- Add real probability engine
- Add authentication
- Automate market resolution

---

## Documentation

- Architecture --> docs/architecture.md
- Decisions --> docs/decision-log.md
- Team process --> docs/team-process.md
- API --> docs/api.md