import type { Market, PositionSide } from "../types/market";

type BackendMarket = {
  id: number;
  title: string;
  pair: string;
  startingPrice: number;
  currentPrice: number;
  startingDate: string;
  endingDate: string;
  status: "OPEN" | "CLOSED";
  yesProbability: number;
  noProbability: number;
  result: PositionSide | null;
};

export async function fetchMarkets(): Promise<Market[]> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/markets`);

  if (!response.ok) {
    throw new Error("Failed to fetch markets");
  }

  const data: BackendMarket[] = await response.json();

  return data.map(
    ({
      id,
      title,
      pair,
      yesProbability,
      status,
      startingDate,
      startingPrice,
      currentPrice,
      endingDate,
      result,
    }) => {
      return {
        id,
        title,
        description: `Will ${pair} price be higher in 5 minutes?`,
        probability: yesProbability,
        status,
        startPrice: startingPrice,
        currentPrice,
        createdAt: startingDate,
        endsAt: endingDate,
        result,
      };
    },
  );
}
