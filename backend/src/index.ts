import express, { Request, Response } from "express";
import cors from "cors";
import pool from "./database";
import { Card, CreateCardRequest, UpdateCardRequest } from "./types";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all cards
app.get("/api/cards", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM cards ORDER BY position");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ error: "Failed to fetch cards" });
  }
});

// Create a new card
app.post("/api/cards", async (req: Request<{}, {}, CreateCardRequest>, res: Response) => {
  try {
    const { title, backgroundColor, textColor } = req.body;

    if (!title || title.trim() === "") {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    // Get the max position in queue
    const maxPositionResult = await pool.query("SELECT MAX(position) as max FROM cards WHERE status = $1", ["queue"]);
    const position = (maxPositionResult.rows[0]?.max || 0) + 1;

    const result = await pool.query("INSERT INTO cards (title, status, position, background_color, text_color) VALUES ($1, $2, $3, $4, $5) RETURNING *", [
      title,
      "queue",
      position,
      backgroundColor || null,
      textColor || null,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({ error: "Failed to create card" });
  }
});

// Update a card
app.patch("/api/cards/:id", async (req: Request<{ id: string }, {}, UpdateCardRequest>, res: Response) => {
  try {
    const { id } = req.params;
    const { status, position } = req.body;

    const cardResult = await pool.query("SELECT * FROM cards WHERE id = $1", [id]);
    const card = cardResult.rows[0] as Card | undefined;

    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    // Check if trying to add a card to a lane that already has one (non-queue lanes)
    if (status && status !== "queue" && status !== card.status) {
      const existingCardResult = await pool.query("SELECT * FROM cards WHERE status = $1 AND id != $2", [status, id]);
      if (existingCardResult.rows.length > 0) {
        res.status(400).json({ error: `Lane ${status} already has a card` });
        return;
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);

      // Reset position when changing status
      if (status === "queue") {
        const maxPositionResult = await pool.query("SELECT MAX(position) as max FROM cards WHERE status = $1", ["queue"]);
        updates.push(`position = $${paramCount++}`);
        values.push((maxPositionResult.rows[0]?.max || 0) + 1);
      } else {
        updates.push(`position = $${paramCount++}`);
        values.push(0);
      }
    } else if (position !== undefined) {
      updates.push(`position = $${paramCount++}`);
      values.push(position);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE cards SET ${updates.join(", ")} WHERE id = $${paramCount}`, values);
    }

    const updatedCardResult = await pool.query("SELECT * FROM cards WHERE id = $1", [id]);
    res.json(updatedCardResult.rows[0]);
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Failed to update card" });
  }
});

// Delete a card
app.delete("/api/cards/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM cards WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// Batch update positions (for reordering in queue)
app.post("/api/cards/reorder", async (req: Request<{}, {}, { cards: { id: number; position: number }[] }>, res: Response) => {
  try {
    const { cards } = req.body;

    if (!cards || !Array.isArray(cards)) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const card of cards) {
        await client.query("UPDATE cards SET position = $1 WHERE id = $2", [card.position, card.id]);
      }

      await client.query("COMMIT");
      res.status(200).json({ success: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error reordering cards:", error);
    res.status(500).json({ error: "Failed to reorder cards" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
