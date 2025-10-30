export interface Card {
  id: number;
  title: string;
  status: 'queue' | 'washer' | 'dryer' | 'fold';
  position: number;
  created_at: string;
}

export interface CreateCardRequest {
  title: string;
}

export interface UpdateCardRequest {
  status?: 'queue' | 'washer' | 'dryer' | 'fold';
  position?: number;
}
