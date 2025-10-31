import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "../types";
import "./LaundryCard.css";

interface LaundryCardProps {
  card: Card;
  isDraggable?: boolean;
}

const LaundryCard: React.FC<LaundryCardProps> = ({ card, isDraggable = true }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id, disabled: !isDraggable });

  // Helper function to generate gradient from a single color
  const generateGradient = (color: string) => {
    // Convert hex to RGB to create a lighter variant
    const r = Number.parseInt(color.slice(1, 3), 16);
    const g = Number.parseInt(color.slice(3, 5), 16);
    const b = Number.parseInt(color.slice(5, 7), 16);

    // Create a lighter version (add 30 to each component, max 255)
    const lighterR = Math.min(255, r + 30);
    const lighterG = Math.min(255, g + 30);
    const lighterB = Math.min(255, b + 30);

    const lighterColor = `rgb(${lighterR}, ${lighterG}, ${lighterB})`;

    return `linear-gradient(135deg, ${lighterColor} 0%, ${color} 100%)`;
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.5 : 1,
    ...(card.backgroundColor &&
      ({
        "--card-bg": generateGradient(card.backgroundColor),
        "--card-text": card.textColor || "#333",
      } as React.CSSProperties)),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`laundry-card ${isDragging ? "dragging" : ""}`}>
      <div className="card-content">
        <span className="card-title">{card.title}</span>
      </div>
    </div>
  );
};

export default LaundryCard;
