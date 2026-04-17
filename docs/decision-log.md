# Decision Log

## 2026-03-11
### Project definition
- Defined Prediction Market Simulator concept
- Binary YES/NO prediction markets
- Simulation-based (no real money)

Goal:
- Model system architecture and market logic
- Not financial product

---

## 2026-03-16
### MVP scope finalized
- Create market
- Take YES/NO positions
- Calculate probability
- Resolve market
- Show results

Out of scope:
- authentication
- blockchain
- real money

Reason:
- Focus on core system logic
- Avoid overengineering

---

## 2026-03-20
### Tech stack decision
- Backend: Java + Spring Boot
- API: REST
- Frontend: React + Tailwind

Reason:
- Fast development
- Clear separation FE/BE

---

## 2026-03-20
### Team workflow rules (Team42)
- 1 PR = 1 task (~300–400 LOC)
- No direct commits to main
- Issue → Branch → PR → Review → Merge
- Review SLA: 24h
- PR must link issue

Goal:
- Keep changes small
- Maintain code quality
- Enable parallel work

---

## 2026-03-21
### Frontend initial setup
- React + Tailwind working
- Markets page skeleton ready
- API layer prepared

Goal:
- Prepare FE for BE integration

---

## 2026-03-25
### System architecture aligned

Flow defined:

FE:
- market → detail → position → result

BE:
- controller → service → probability

DB:
- markets
- positions

Goal:
- Single clear E2E flow
- Avoid ambiguity

---

## 2026-03-28
### MVP deadline decision
- Target: MVP live by Sunday

Responsibilities assigned:
- Backend API
- Market logic
- Frontend integration

Reason:
- Force execution
- Avoid endless planning

---

## 2026-04-01
### Core backend features implemented
- BybitApiService (price source)
- GET /markets
- MarketType model
- PostgreSQL setup
- CI pipeline

Reason:
- Establish production-like backend foundation

---

## 2026-04-10
### Single market strategy (MVP constraint)
- Only one BTC market supported
- `/markets` returns single market

Reason:
- Simplify FE/BE integration
- Validate system before scaling

---

## 2026-04-10
### Hardcoded market response (temporary)
- `/markets` not fully DB-driven
- Stable response contract for FE

Reason:
- Avoid blocking frontend
- Ensure predictable structure

---

## 2026-04-10
### Position creation endpoint
- POST /position added
- Validates:
  - marketId
  - userId
  - positionType
  - amount

Reason:
- Core user interaction
- Minimal validation for MVP

---

## 2026-04-10
### Market resolution endpoint
- POST /resolve added
- Updates:
  - all positions (WIN/LOSS)
  - market result
  - market status

Reason:
- Explicit control over resolution
- Easy testing

---

## 2026-04-10
### Batch position resolution
- Uses DB queries (no loops)
- WIN / LOSS updated in bulk

Reason:
- Performance
- Simplicity
- Clean service layer

---

## 2026-04-10
### Transactional safety
- @Transactional added to PositionService

Reason:
- Ensure atomic updates
- Prevent partial resolution

---

## 2026-04-10
### No authentication (explicit decision)
- All endpoints open

Reason:
- MVP speed
- Focus on system correctness

Risk:
- Endpoint abuse (accepted)

---

## 2026-04-10
### Frontend simulation layer
- FE simulates:
  - price movement
  - result logic

Reason:
- Backend not providing live updates
- Enables independent FE progress

---

## 2026-04-10
### API-first contract
- Backend defines response shape
- Frontend adapts to it

Reason:
- Prevent integration issues
- Parallel development

---

## 2026-04-10
### UI evolution: detail-first view
- Removed market list view
- Single MarketDetailPage

Reason:
- Align with single-market MVP
- Simpler UX

---

## Known Risks

- No authentication → security risk
- Hardcoded market → not scalable
- FE simulation ≠ real backend data
- Manual resolve endpoint → no automation

---

## Next Decisions (Planned)

- Replace FE simulation with backend data
- Add authentication (users/admin)
- Add real probability engine
- Add multiple markets
- Add scheduled auto-resolution
- Replace hardcoded `/markets` with DB-backed list