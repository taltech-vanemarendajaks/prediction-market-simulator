export type MarketStatus = "OPEN" | "CLOSED" | "RESOLVED";

export type PositionSide = "YES" | "NO";

export type Market = {
  id: string;
  title: string;
  description: string;
  probability: number; // 0 to 1
  status: MarketStatus;
  startPrice: number;
  currentPrice: number;
  createdAt: string;
  endsAt: string;
};

export type UserPosition = {
  marketId: string;
  side: PositionSide;
};
