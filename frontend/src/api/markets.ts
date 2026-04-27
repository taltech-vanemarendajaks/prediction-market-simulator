import type { Market, PositionSide } from "../types/market";

type BackendMarket = {
  id: number;
  title: string;
  pair: string;
  startingPrice: number;
  endingPrice: number;
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
      endingPrice,
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
        endingPrice,
        createdAt: startingDate,
        endsAt: endingDate,
        result,
      };
    },
  );
}

export async function fetchMarketById(id: number): Promise<Market> {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/markets/${id}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch market");
  }

  const {
    title,
    pair,
    yesProbability,
    status,
    startingDate,
    startingPrice,
    endingPrice,
    endingDate,
    result,
  }: BackendMarket = await response.json();

  return {
    id,
    title,
    description: `Will ${pair} price be higher in 5 minutes?`,
    probability: yesProbability,
    status,
    startPrice: startingPrice,
    endingPrice,
    createdAt: startingDate,
    endsAt: endingDate,
    result,
  };
}