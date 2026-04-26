const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type ClaimStarterResponse = {
  message: string;
  userId: number;
  balance: number;
  starterClaimed: boolean;
};

export async function claimStarterCoins(): Promise<ClaimStarterResponse> {
  const response = await fetch(`${API_BASE_URL}/wallet/claim`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}