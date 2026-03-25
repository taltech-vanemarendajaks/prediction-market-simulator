import type { Market } from "../types/market";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchMarkets(): Promise<Market[]> {
  const response = await fetch(`${API_BASE_URL}/markets`);

  if (!response.ok) {
    throw new Error("Failed to fetch markets");
  }

  return response.json();
}
