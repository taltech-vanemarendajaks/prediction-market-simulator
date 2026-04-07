import type { Market } from "../types/market";

type BackendMarket = {
  id: number;
  title: string;
  pair: string;
  startingPrice: number;
  startingDate: string;
  endingDate: string;
  status: "OPEN" | "CLOSED" | "RESOLVED";
  yesProbability: number;
  noProbability: number;
};

export async function fetchMarkets(): Promise<Market[]> {
  const response = await fetch("http://localhost:8080/api/markets");

  if (!response.ok) {
    throw new Error("Failed to fetch markets");
  }

  const data: BackendMarket[] = await response.json();

  return data.map((market) => {
    const simulatedMove = Math.random() * 200 - 100;

    return {
      id: String(market.id),
      title: market.title,
      description: `Will ${market.pair} price be higher in 5 minutes?`,
      probability: market.yesProbability / 100,
      status: market.status,
      startPrice: market.startingPrice,
      currentPrice: Number((market.startingPrice + simulatedMove).toFixed(2)),
      createdAt: market.startingDate,
      endsAt: market.endingDate,
    };
  });
}
