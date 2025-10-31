export interface Card {
  id: number;
  title: string;
  status: "queue" | "washer" | "dryer" | "fold";
  position: number;
  created_at: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface CreateCardRequest {
  title: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface UpdateCardRequest {
  status?: "queue" | "washer" | "dryer" | "fold";
  position?: number;
}
