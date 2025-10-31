import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Card, Lane } from "../types";
import LaundryCard from "./LaundryCard";
import "./LaundryLane.css";

interface LaundryLaneProps {
  lane: Lane;
  cards: Card[];
}

const LaundryLane: React.FC<LaundryLaneProps> = ({ lane, cards }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: lane.id,
  });

  const isEmpty = cards.length === 0;
  const isFull = lane.maxCards ? cards.length >= lane.maxCards : false;

  return (
    <div className="lane">
      <div className="lane-header">
        <h2 className="lane-title">{lane.title}</h2>
        {lane.maxCards && (
          <span className="lane-capacity">
            {cards.length}/{lane.maxCards}
          </span>
        )}
      </div>
      <div ref={setNodeRef} className={`lane-content ${isOver ? "drag-over" : ""} ${isEmpty ? "empty" : ""} ${isFull ? "full" : ""}`}>
        {isEmpty ? <div className="empty-state">Drop laundry here</div> : cards.map((card) => <LaundryCard key={card.id} card={card} isDraggable={true} />)}
      </div>
    </div>
  );
};

export default LaundryLane;
