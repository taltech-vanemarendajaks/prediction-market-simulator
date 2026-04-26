import type { PositionSide } from "../types/market";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type SubmitPositionPayload = {
  marketId: number;
  userId: number;
  positionType: PositionSide;
  amount: number;
};

export type SubmitPositionResponse = {
  message: string;
  positionId: number;
  marketId: number;
  userId: number;
  positionType: PositionSide;
  amount: number;
  balance: number;
};

export type MyPosition = {
  positionId: number;
  marketId: number;
  marketTitle: string;
  marketStatus: "OPEN" | "CLOSED";
  marketResult: PositionSide | "PENDING";
  userId: number;
  positionType: PositionSide;
  amount: number;
  positionResult: "WIN" | "LOSS" | "PENDING";
  createdAt: string;
};

export async function submitPosition(
  payload: SubmitPositionPayload,
): Promise<SubmitPositionResponse> {
  const response = await fetch(`${API_BASE_URL}/position`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to submit position");
  }

  return response.json();
}

export async function fetchMyPositions(): Promise<MyPosition[]> {
  const response = await fetch(`${API_BASE_URL}/positions/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load positions");
  }

  return response.json();
}
