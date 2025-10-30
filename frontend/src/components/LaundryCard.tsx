import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../types';
import './LaundryCard.css';

interface LaundryCardProps {
  card: Card;
  onDelete: (id: number) => void;
  isDraggable?: boolean;
}

const LaundryCard: React.FC<LaundryCardProps> = ({ card, onDelete, isDraggable = true }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`laundry-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="card-content">
        <span className="card-title">{card.title}</span>
        <button
          className="delete-button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card.id);
          }}
          title="Delete card"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default LaundryCard;
