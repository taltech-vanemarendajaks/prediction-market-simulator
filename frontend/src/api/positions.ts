import type { PositionSide } from "../types/market";

type SubmitPositionPayload = {
  marketId: number;
  positionType: PositionSide;
  amount: number;
  userId: number;
};

// TODO: enable once /api/positions endpoint is finalized on backend
export async function submitPosition(payload: SubmitPositionPayload) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/positions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to submit position");
  }

  return response.json();
}
