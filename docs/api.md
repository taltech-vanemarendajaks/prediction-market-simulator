# API Documentation – Prediction Market Simulator

## Base URL

Local:
`http://localhost:8080/api`

Note:
Base URL is environment-dependent (dev / staging / production).

---

## Overview

This API currently supports the MVP backend flow for a single BTC 5-minute prediction market.

Implemented endpoints:
- `GET /markets`
- `POST /position`
- `POST /resolve`

Current MVP constraints:
- Single BTC market only
- No authentication
- No wallet/cash flow
- No multiple market categories
- No chart/history endpoints

---

## 1. GET /markets

### Description
Returns the active BTC prediction market for frontend display.

### Endpoint
`GET /api/markets`

### Response
`200 OK`

```json
[
  {
    "id": 1,
    "title": "BTC 5 Minute UP or DOWN",
    "pair": "BTCUSDT",
    "startingPrice": 72279.2,
    "startingDate": "2026-04-10T04:45:38.926434100",
    "endingDate": "2026-04-10T04:50:38.926434100",
    "status": "OPEN",
    "yesProbability": 50.0,
    "noProbability": 50.0
  }
]
````

### Response fields

| Field            | Type   | Description                                 |
| ---------------- | ------ | ------------------------------------------- |
| `id`             | number | Market ID                                   |
| `title`          | string | Market title                                |
| `pair`           | string | Trading pair, currently `BTCUSDT`           |
| `startingPrice`  | number | BTC price at market creation time           |
| `startingDate`   | string | Market start timestamp (ISO-like string)    |
| `endingDate`     | string | Market end timestamp (ISO-like string)      |
| `status`         | string | Market status, currently `OPEN` or `CLOSED` |
| `yesProbability` | number | YES-side probability percentage             |
| `noProbability`  | number | NO-side probability percentage              |

### Notes

* Response contract is stable for frontend integration (MVP lock).
* Current implementation returns a single hardcoded BTC market structure.
* `startingPrice` is fetched live from Bybit.
* Endpoint does not currently return persisted DB market objects for list display.

### Error response

`500 Internal Server Error`

```json
"Failed to fetch BTC price"
```

---

## 2. POST /position

### Description

Creates a user position for the selected BTC market.

### Endpoint

`POST /api/position`

### Request body

```json
{
  "marketId": 1,
  "userId": 1,
  "positionType": "UP",
  "amount": 50
}
```

### Request fields

| Field          | Type   | Required | Description                    |
| -------------- | ------ | -------- | ------------------------------ |
| `marketId`     | number | yes      | Existing market ID             |
| `userId`       | number | yes      | User ID                        |
| `positionType` | string | yes      | Must be `UP` or `DOWN`         |
| `amount`       | number | yes      | Position amount, must be `> 0` |

### Success response

`200 OK`

```json
{
  "message": "Position created successfully",
  "positionId": 5,
  "marketId": 1,
  "userId": 1,
  "positionType": "UP",
  "amount": 50.0
}
```

### Validation rules

* `marketId` is required
* `userId` is required
* `positionType` is required
* `amount` is required
* `positionType` must be `UP` or `DOWN`
* `amount` must be greater than `0`
* `marketId` must exist in database

### Error responses

#### Missing fields

`400 Bad Request`

```json
"marketId, userId, positionType and amount are required"
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

#### Market not found

`404 Not Found`

```json
"Market not found"
```

---

## 3. POST /resolve

### Description

Resolves a market by setting the winning direction and updating all associated positions.

### Endpoint

`POST /api/resolve`

### Request body

```json
{
  "marketId": 1,
  "result": "UP"
}
```

### Request fields

| Field      | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| `marketId` | number | yes      | Existing market ID     |
| `result`   | string | yes      | Must be `UP` or `DOWN` |

### Success response

`200 OK`

```json
{
  "message": "Market resolved successfully",
  "marketId": 1,
  "result": "UP",
  "status": "CLOSED"
}
```

### What happens internally

* Validates request
* Loads market by `marketId`
* Resolves matching positions in batch:

  * winning side -> `WIN`
  * losing side -> `LOSS`
* Updates market:

  * `result = UP | DOWN`
  * `status = CLOSED`

### Validation rules

* `marketId` is required
* `result` is required
* `result` must be `UP` or `DOWN`
* `marketId` must exist

### Error responses

#### Missing fields

`400 Bad Request`

```json
"marketId and result are required"
```

#### Invalid result

`400 Bad Request`

```json
"result must be UP or DOWN"
```

#### Market not found

`404 Not Found`

```json
"Market not found"
```

---

## Position Resolution Rules

When a market is resolved:

If:

```json
{
  "marketId": 1,
  "result": "UP"
}
```

Then:

* all positions with `positionType = UP` become `WIN`
* all positions with `positionType = DOWN` become `LOSS`

If:

```json
{
  "marketId": 1,
  "result": "DOWN"
}
```

Then:

* all positions with `positionType = DOWN` become `WIN`
* all positions with `positionType = UP` become `LOSS`

---

## Current Data Model Summary

### Market

* `id`
* `title`
* `createdAt`
* `startingPrice`
* `startingDate`
* `endingDate`
* `status`
* `result`
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

### 1. Fetch market

`GET /api/markets`

### 2. Submit position

`POST /api/position`

```json
{
  "marketId": 1,
  "userId": 1,
  "positionType": "UP",
  "amount": 50
}
```

### 3. Resolve market

`POST /api/resolve`

```json
{
  "marketId": 1,
  "result": "UP"
}
```

### 4. Final outcome

* market status becomes `CLOSED`
* market result becomes `UP`
* all `UP` positions become `WIN`
* all `DOWN` positions become `LOSS`

---

## Known MVP Limitations

* No auth or user session validation
* No admin protection for `/resolve`
* No market creation endpoint yet
* `/markets` response is still hardcoded for MVP response shape
* No pagination
* No OpenAPI/Swagger integration yet
* * FE currently uses partial client-side simulation for price and result logic (not fully backend-driven) and is not fully connected to `POST /position` and `POST /resolve`

---

## Suggested Next API Improvements

1. Add `POST /markets` for market creation
2. Add `GET /markets/{id}` for detail fetch
3. Add `GET /markets/{id}/positions` if needed for admin/debug
4. Protect `POST /resolve` behind admin/auth later
5. Replace hardcoded `/markets` response with DB-backed market list
6. Add Swagger/OpenAPI generation