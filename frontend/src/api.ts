import { Card } from "./types";

const API_BASE = "http://localhost:3001/api";

export const api = {
  async getCards(): Promise<Card[]> {
    const response = await fetch(`${API_BASE}/cards`);
    if (!response.ok) throw new Error("Failed to fetch cards");
    return response.json();
  },

  async createCard(title: string, backgroundColor?: string, textColor?: string): Promise<Card> {
    const response = await fetch(`${API_BASE}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, backgroundColor, textColor }),
    });
    if (!response.ok) throw new Error("Failed to create card");
    return response.json();
  },

  async updateCard(id: number, updates: { status?: string; position?: number }): Promise<Card> {
    const response = await fetch(`${API_BASE}/cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update card");
    }
    return response.json();
  },

  async deleteCard(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/cards/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete card");
  },

  async reorderCards(cards: { id: number; position: number }[]): Promise<void> {
    const response = await fetch(`${API_BASE}/cards/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cards }),
    });
    if (!response.ok) throw new Error("Failed to reorder cards");
  },
};
