# API Documentation – Prediction Market Simulator

## Base URL

Local:  
`http://localhost:8080/api`

Note:  
Base URL is environment-dependent (dev / staging / production).

---

## Overview

This API currently supports the MVP backend flow for a single BTC 5-minute prediction market with session-based authentication and wallet-based betting.

Implemented endpoints:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /wallet/claim`
- `GET /markets`
- `POST /position`
- `GET /positions/me`
- `GET /resolve`

Current MVP constraints:
- Single BTC market only
- Session-based auth only
- One-time starter wallet claim
- No wallet transaction history yet
- No multiple market categories
- No chart/history endpoints
- No admin/manual resolve endpoint

---

## Authentication Model

Authentication is session-based using `HttpSession`.

After successful login:
- server creates session
- session stores `USER_ID`
- authenticated endpoints require valid session cookie

Current authenticated endpoints:
- `POST /api/position`
- `GET /api/positions/me`
- `POST /api/wallet/claim`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Notes:
- frontend/client must persist and send session cookie
- spoofed `userId` is ignored for position creation
- backend always uses authenticated session user

---

## 1. POST /auth/register

### Description
Registers a new user account.

### Endpoint
`POST /api/auth/register`

### Request body

```json
{
  "name": "user1",
  "email": "user1@test.com",
  "password": "123456"
}
````

### Request fields

| Field      | Type   | Required | Description             |
| ---------- | ------ | -------- | ----------------------- |
| `name`     | string | yes      | Display name            |
| `email`    | string | yes      | Unique user email       |
| `password` | string | yes      | Plain password at input |

### Success response

`200 OK`

```json
{
  "id": 1,
  "name": "user1",
  "email": "user1@test.com"
}
```

### Error responses

#### Invalid request

`400 Bad Request`

#### Email already exists

`400 Bad Request`

---

## 2. POST /auth/login

### Description

Authenticates user and creates server-side session.

### Endpoint

`POST /api/auth/login`

### Request body

```json
{
  "email": "user1@test.com",
  "password": "123456"
}
```

### Success response

`200 OK`

```json
{
  "id": 1,
  "name": "user1",
  "email": "user1@test.com"
}
```

### Error responses

#### Invalid credentials

`401 Unauthorized`

```json
"Invalid email or password"
```

---

## 3. GET /auth/me

### Description

Returns authenticated session user state.

### Endpoint

`GET /api/auth/me`

### Success response

`200 OK`

```json
{
  "userId": 1,
  "balance": 500.0,
  "starterClaimed": true
}
```

### Response fields

| Field            | Type    | Description                        |
| ---------------- | ------- | ---------------------------------- |
| `userId`         | number  | Authenticated user ID              |
| `balance`        | number  | Current wallet balance             |
| `starterClaimed` | boolean | Whether starter wallet was claimed |

### Error responses

#### Not authenticated

`401 Unauthorized`

```json
"Not authenticated"
```

---

## 4. POST /auth/logout

### Description

Invalidates current session.

### Endpoint

`POST /api/auth/logout`

### Success response

`200 OK`

```json
"Logged out successfully"
```

---

## 5. POST /wallet/claim

### Description

Claims one-time starter wallet balance for authenticated user.

### Endpoint

`POST /api/wallet/claim`

### Authentication

Required

### Success response

`200 OK`

```json
{
  "message": "Starter coins claimed successfully",
  "userId": 1,
  "balance": 500.0,
  "starterClaimed": true
}
```

### Rules

* can only be claimed once per user
* starter amount is currently `500`

### Error responses

#### Not authenticated

`401 Unauthorized`

```json
"Not authenticated"
```

#### Already claimed

`400 Bad Request`

```json
"Starter coins already claimed"
```

---

## 6. GET /markets

### Description

Returns the current latest BTC prediction market for frontend display.

### Endpoint

`GET /api/markets`

### Response

`200 OK`

```json
[
  {
    "id": 83,
    "title": "BTC 5 Minute UP or DOWN",
    "pair": "BTCUSDT",
    "startingPrice": 78985.5,
    "endingPrice": 78985.5,
    "startingDate": "2026-04-22T21:35:00",
    "endingDate": "2026-04-22T21:40:00",
    "status": "OPEN",
    "result": null,
    "yesProbability": 50.0,
    "noProbability": 50.0
  }
]
```

### Response fields

| Field            | Type   | Description                                |
| ---------------- | ------ | ------------------------------------------ |
| `id`             | number | Market ID                                  |
| `title`          | string | Market title                               |
| `pair`           | string | Trading pair, currently `BTCUSDT`          |
| `startingPrice`  | number | BTC price at market creation time          |
| `endingPrice`    | number | Current placeholder or final closing price |
| `startingDate`   | string | Market start timestamp                     |
| `endingDate`     | string | Market end timestamp                       |
| `status`         | string | `OPEN` or `CLOSED`                         |
| `result`         | string | `UP`, `DOWN`, or `null`                    |
| `yesProbability` | number | UP-side probability percentage             |
| `noProbability`  | number | DOWN-side probability percentage           |

### Notes

* response currently returns latest market wrapped as single-item list
* market lifecycle is scheduler-driven
* odds are calculated from persisted positions

### Empty response

`204 No Content`

If no market exists yet.

---

## 7. POST /position

### Description

Creates a position for the authenticated user on an open market and deducts balance.

### Endpoint

`POST /api/position`

### Authentication

Required

### Request body

```json
{
  "marketId": 83,
  "positionType": "UP",
  "amount": 100
}
```

### Request fields

| Field          | Type   | Required | Description                    |
| -------------- | ------ | -------- | ------------------------------ |
| `marketId`     | number | yes      | Existing market ID             |
| `positionType` | string | yes      | Must be `UP` or `DOWN`         |
| `amount`       | number | yes      | Position amount, must be `> 0` |

### Success response

`200 OK`

```json
{
  "message": "Position created successfully",
  "positionId": 9,
  "marketId": 83,
  "userId": 1,
  "positionType": "UP",
  "amount": 100.0,
  "balance": 400.0
}
```

### Validation rules

* authenticated session required
* `marketId` is required
* `positionType` is required
* `amount` is required
* `positionType` must be `UP` or `DOWN`
* `amount` must be greater than `0`
* market must exist
* market must be `OPEN`
* user must have sufficient balance
* request `userId` is not accepted or trusted

### Error responses

#### Not authenticated

`401 Unauthorized`

```json
"Not authenticated"
```

#### User not found

`404 Not Found`

```json
"User not found"
```

#### Missing fields

`400 Bad Request`

```json
"marketId, positionType and amount are required"
```

#### Invalid position type

`400 Bad Request`

```json
"positionType must be UP or DOWN"
```

#### Invalid amount

`400 Bad Request`

```json
"amount must be greater than 0"
```

#### Insufficient balance

`400 Bad Request`

```json
"Insufficient balance"
```

#### Market not found

`404 Not Found`

```json
"Market not found"
```

#### Market closed

`400 Bad Request`

```json
"Market is not open"
```

### Notes

* balance deduction and position save are transactional
* authenticated session user is always used as position owner

---

## 8. GET /positions/me

### Description

Returns all positions for the authenticated user ordered by newest first.

### Endpoint

`GET /api/positions/me`

### Authentication

Required

### Success response

`200 OK`

```json
[
  {
    "positionId": 9,
    "marketId": 83,
    "marketTitle": "BTC 5 Minute UP or DOWN",
    "marketStatus": "CLOSED",
    "marketResult": "UP",
    "userId": 1,
    "positionType": "UP",
    "amount": 100.0,
    "positionResult": "WIN",
    "createdAt": "2026-04-22T21:35:58.125787"
  }
]
```

### Response fields

| Field            | Type   | Description                 |
| ---------------- | ------ | --------------------------- |
| `positionId`     | number | Position ID                 |
| `marketId`       | number | Market ID                   |
| `marketTitle`    | string | Market title                |
| `marketStatus`   | string | Market status               |
| `marketResult`   | string | Market result or `PENDING`  |
| `userId`         | number | Authenticated user ID       |
| `positionType`   | string | `UP` or `DOWN`              |
| `amount`         | number | Position amount             |
| `positionResult` | string | `WIN`, `LOSS`, or `PENDING` |
| `createdAt`      | string | Creation timestamp          |

### Error responses

#### Not authenticated

`401 Unauthorized`

```json
"Not authenticated"
```

---

## 9. GET /resolve

### Description

Returns the last most recently closed market result.

### Endpoint

`GET /api/resolve`

### Success response

`200 OK`

```json
{
  "marketId": 83,
  "endingPrice": 79020.1,
  "result": "UP",
  "status": "CLOSED"
}
```

### Response fields

| Field         | Type   | Description                |
| ------------- | ------ | -------------------------- |
| `marketId`    | number | Closed market ID           |
| `endingPrice` | number | Final market closing price |
| `result`      | string | `UP`, `DOWN`, or `PENDING` |
| `status`      | string | Market status              |

### Error responses

#### No closed market found

`404 Not Found`

---

## Market Resolution & Payout Rules

Markets are resolved automatically by scheduler.

On market close:

* closing price is fetched from Bybit
* market result is determined:

  * `UP` if `endingPrice >= startingPrice`
  * `DOWN` if `endingPrice < startingPrice`
* positions are resolved:

  * matching side -> `WIN`
  * opposite side -> `LOSS`

Payout rules:

* user balance is deducted at bet placement
* winning positions receive `2x amount`
* losing positions receive nothing
* payout is processed once per market using `payoutProcessed` guard

Example:

* user balance = `500`
* user places `100` on `UP`
* balance becomes `400`
* if market resolves `UP`, payout = `200`
* final balance becomes `600`

---

## Current Data Model Summary

### User

* `id`
* `name`
* `email`
* `passwordHash`
* `balance`
* `starterClaimed`

### Market

* `id`
* `title`
* `createdAt`
* `startingPrice`
* `startingDate`
* `endingDate`
* `status`
* `result`
* `endingPrice`
* `payoutProcessed`
* `marketType`

### Position

* `id`
* `userId`
* `market`
* `positionType`
* `amount`
* `createdAt`
* `result`

### MarketType

* `id`
* `ticker`
* `api`
* `enabled`
* `createDate`

---

## Example End-to-End Flow

### 1. Register

`POST /api/auth/register`

### 2. Login

`POST /api/auth/login`

### 3. Check session state

`GET /api/auth/me`

### 4. Claim starter balance

`POST /api/wallet/claim`

### 5. Fetch market

`GET /api/markets`

### 6. Submit position

`POST /api/position`

```json
{
  "marketId": 83,
  "positionType": "UP",
  "amount": 100
}
```

### 7. Wait for scheduler-driven market close

* market becomes `CLOSED`
* result becomes `UP` or `DOWN`
* positions become `WIN` / `LOSS`
* winners receive payout

### 8. Check user positions

`GET /api/positions/me`

### 9. Check wallet state

`GET /api/auth/me`

---

## Known MVP Limitations

* No wallet transaction history yet
* No manual/admin resolve endpoint
* `/markets` returns latest market wrapped in array instead of full list API
* No pagination
* No OpenAPI/Swagger integration yet
* No multiple market categories
* No withdrawal / deposit system
* No fee model beyond basic wallet deduction/payout
* frontend is not yet fully integrated with auth + wallet flow

---

## Suggested Next API Improvements

1. Add wallet transaction history
2. Add `GET /wallet/transactions`
3. Add admin/manual resolve endpoint for dev/debug
4. Add `GET /markets/{id}` for market detail
5. Replace `/markets` single-item response with DB-backed list model
6. Protect future admin actions behind role/auth
7. Add Swagger/OpenAPI generation