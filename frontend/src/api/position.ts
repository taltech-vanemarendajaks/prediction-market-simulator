import type { PositionSide } from "../types/market";

type SubmitPositionPayload = {
  marketId: number;
  positionType: PositionSide;
  amount: number;
};

export async function submitPosition(payload: SubmitPositionPayload) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/position`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to submit position");
  }

  return response.json();
}
