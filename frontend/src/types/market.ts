export type MarketStatus = "OPEN" | "CLOSED";

export type PositionSide = "UP" | "DOWN";

export type Market = {
  id: number;
  title: string;
  description: string;
  probability: number;
  status: MarketStatus;
  startPrice: number;
  endingPrice: number;
  createdAt: string;
  endsAt: string;
  result: PositionSide | null;
};

export type UserPosition = {
  marketId: number;
  side: PositionSide;
};
