import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import "./App.css";
import { Card as CardType, Lane, LaneId } from "./types";
import { api } from "./api";
import LaundryLane from "./components/LaundryLane";
import LaundryCard from "./components/LaundryCard";
import CreateCardModal from "./components/CreateCardModal";

// Trash component for drag-to-delete
const TrashZone: React.FC<{ isOver: boolean }> = ({ isOver }) => {
  const { setNodeRef } = useDroppable({
    id: "trash",
  });

  return (
    <div ref={setNodeRef} className={`trash-zone ${isOver ? "trash-over" : ""}`} title="Drag cards here to delete them">
      🗑️
    </div>
  );
};

function App() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lanes: Lane[] = [
    { id: "queue", title: "Queue" },
    { id: "washer", title: "In Washer", maxCards: 1 },
    { id: "dryer", title: "In Dryer", maxCards: 1 },
    { id: "fold", title: "Fold Ready", maxCards: 1 },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const fetchedCards = await api.getCards();
      setCards(fetchedCards);
      setError(null);
    } catch (err) {
      setError("Failed to load cards");
      console.error(err);
    }
  };

  const handleCreateCard = async (title: string, backgroundColor: string, textColor: string) => {
    try {
      await api.createCard(title, backgroundColor, textColor);
      await loadCards();
      setShowCreateModal(false);
      setError(null);
    } catch (err) {
      setError("Failed to create card");
      console.error(err);
    }
  };

  const getCardsForLane = (laneId: LaneId): CardType[] => {
    return cards.filter((card) => card.status === laneId).sort((a, b) => a.position - b.position);
  };

  const [isOverTrash, setIsOverTrash] = useState(false);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
    setIsOverTrash(false);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    setIsOverTrash(over?.id === "trash");
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeCard = cards.find((c) => c.id === active.id);
    if (!activeCard) return;

    const overId = over.id;

    // Check if dropping on trash (delete card)
    if (overId === "trash") {
      try {
        await api.deleteCard(activeCard.id);
        await loadCards();
        setError(null);
      } catch (err: any) {
        setError("Failed to delete card");
        console.error(err);
      }
      return;
    }

    // Check if dropping on a lane
    const overLane = lanes.find((l) => l.id === overId);
    if (overLane) {
      // Dropping on a lane
      const laneCards = getCardsForLane(overLane.id);

      // Check if lane has max cards limit and is full
      if (overLane.maxCards && laneCards.length >= overLane.maxCards && activeCard.status !== overLane.id) {
        setError(`${overLane.title} lane can only have ${overLane.maxCards} card at a time`);
        return;
      }

      if (activeCard.status !== overLane.id) {
        try {
          await api.updateCard(activeCard.id, { status: overLane.id });
          await loadCards();
          setError(null);
        } catch (err: any) {
          setError(err.message || "Failed to move card");
          console.error(err);
        }
      }
      return;
    }

    // Check if reordering within queue
    const overCard = cards.find((c) => c.id === overId);
    if (overCard && activeCard.status === "queue" && overCard.status === "queue") {
      const queueCards = getCardsForLane("queue");
      const oldIndex = queueCards.findIndex((c) => c.id === activeCard.id);
      const newIndex = queueCards.findIndex((c) => c.id === overCard.id);

      if (oldIndex !== newIndex) {
        const reorderedCards = arrayMove(queueCards, oldIndex, newIndex);
        const updates = reorderedCards.map((card, index) => ({
          id: card.id,
          position: index,
        }));

        try {
          await api.reorderCards(updates);
          await loadCards();
          setError(null);
        } catch (err) {
          setError("Failed to reorder cards");
          console.error(err);
        }
      }
    }
  };

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

  return (
    <div className="App">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <header className="App-header">
          <h1>🧺 Laundry Tracker</h1>
          <div className="header-actions">
            <button className="create-button" onClick={() => setShowCreateModal(true)}>
              + Add Laundry
            </button>
            <TrashZone isOver={isOverTrash} />
          </div>
        </header>

        {error && (
          <div className="error-banner" onClick={() => setError(null)}>
            {error} (click to dismiss)
          </div>
        )}

        <div className="lanes-container">
          {lanes.map((lane) => (
            <SortableContext
              key={lane.id}
              items={getCardsForLane(lane.id).map((c) => c.id)}
              strategy={lane.id === "queue" ? verticalListSortingStrategy : undefined}
            >
              <LaundryLane lane={lane} cards={getCardsForLane(lane.id)} />
            </SortableContext>
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 0 }}>
          {activeCard ? (
            <div className="drag-overlay">
              <LaundryCard card={activeCard} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showCreateModal && <CreateCardModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateCard} />}
    </div>
  );
}

export default App;
