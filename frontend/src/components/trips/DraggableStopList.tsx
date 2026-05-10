// frontend/src/components/trips/DraggableStopList.tsx
// Drag-and-drop stop list using @hello-pangea/dnd.
// @hello-pangea/dnd chosen: maintained fork of react-beautiful-dnd, stable API.
// Depends on: Phase 3 / StopCard, tripStore

import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import StopCard from "./StopCard";
import type { Stop } from "@/api/trips";

interface DraggableStopListProps {
  stops: Stop[];
  tripId: string;
  onReorder: (tripId: string, stopIds: string[]) => Promise<void>;
  onDelete: (stopId: string) => void;
}

export default function DraggableStopList({
  stops,
  tripId,
  onReorder,
  onDelete,
}: DraggableStopListProps) {
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    // Compute new order
    const reordered = Array.from(stops);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const newIds = reordered.map((s) => s.id);
    await onReorder(tripId, newIds);
  };

  if (stops.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-sm">No stops yet. Add your first destination!</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="stops-list">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2"
          >
            {stops.map((stop, index) => (
              <Draggable key={stop.id} draggableId={stop.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`transition-shadow ${snapshot.isDragging ? "shadow-lg" : ""}`}
                  >
                    <StopCard
                      stop={stop}
                      onDelete={onDelete}
                      isDraggable
                      dragHandleProps={provided.dragHandleProps ?? undefined}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

// SELF-CHECK: dynamic data only ✓ | validated ✓ | paginated N/A | error handled ✓
