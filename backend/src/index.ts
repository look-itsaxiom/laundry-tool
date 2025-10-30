import express, { Request, Response } from 'express';
import cors from 'cors';
import db from './database';
import { Card, CreateCardRequest, UpdateCardRequest } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Get all cards
app.get('/api/cards', (req: Request, res: Response) => {
  try {
    const cards = db.prepare('SELECT * FROM cards ORDER BY position').all() as Card[];
    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Create a new card
app.post('/api/cards', (req: Request<{}, {}, CreateCardRequest>, res: Response) => {
  try {
    const { title } = req.body;
    
    if (!title || title.trim() === '') {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    // Get the max position in queue
    const maxPosition = db.prepare('SELECT MAX(position) as max FROM cards WHERE status = ?').get('queue') as { max: number | null };
    const position = (maxPosition.max || 0) + 1;

    const result = db.prepare('INSERT INTO cards (title, status, position) VALUES (?, ?, ?)').run(title, 'queue', position);
    const newCard = db.prepare('SELECT * FROM cards WHERE id = ?').get(result.lastInsertRowid) as Card;
    
    res.status(201).json(newCard);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update a card
app.patch('/api/cards/:id', (req: Request<{ id: string }, {}, UpdateCardRequest>, res: Response) => {
  try {
    const { id } = req.params;
    const { status, position } = req.body;

    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as Card | undefined;
    
    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    // Check if trying to add a card to a lane that already has one (non-queue lanes)
    if (status && status !== 'queue' && status !== card.status) {
      const existingCard = db.prepare('SELECT * FROM cards WHERE status = ? AND id != ?').get(status, id) as Card | undefined;
      if (existingCard) {
        res.status(400).json({ error: `Lane ${status} already has a card` });
        return;
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
      
      // Reset position when changing status
      if (status === 'queue') {
        const maxPosition = db.prepare('SELECT MAX(position) as max FROM cards WHERE status = ?').get('queue') as { max: number | null };
        updates.push('position = ?');
        values.push((maxPosition.max || 0) + 1);
      } else {
        updates.push('position = ?');
        values.push(0);
      }
    } else if (position !== undefined) {
      updates.push('position = ?');
      values.push(position);
    }

    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE cards SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updatedCard = db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as Card;
    res.json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete a card
app.delete('/api/cards/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM cards WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Batch update positions (for reordering in queue)
app.post('/api/cards/reorder', (req: Request<{}, {}, { cards: { id: number; position: number }[] }>, res: Response) => {
  try {
    const { cards } = req.body;
    
    if (!cards || !Array.isArray(cards)) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const updateStmt = db.prepare('UPDATE cards SET position = ? WHERE id = ?');
    const transaction = db.transaction((cardsToUpdate: { id: number; position: number }[]) => {
      for (const card of cardsToUpdate) {
        updateStmt.run(card.position, card.id);
      }
    });

    transaction(cards);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error reordering cards:', error);
    res.status(500).json({ error: 'Failed to reorder cards' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
