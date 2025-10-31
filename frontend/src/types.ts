export interface Card {
  id: number;
  title: string;
  status: "queue" | "washer" | "dryer" | "fold";
  position: number;
  created_at: string;
  backgroundColor?: string;
  textColor?: string;
}

export type LaneId = "queue" | "washer" | "dryer" | "fold";

export interface Lane {
  id: LaneId;
  title: string;
  maxCards?: number;
}
