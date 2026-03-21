export type Market = {
  id: string;
  title: string;
  description: string;
  probability: number;
  status: "OPEN" | "RESOLVED";
};
