import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { MealCalendar } from '../components/calendar/MealCalendar';
import { GroceryList } from '../components/list/GroceryList';
import { usePantry } from '../context/PantryContext';

export function CalendarPage() {
  const { calendar, setCalendar } = usePantry();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    // Moving between days
    if (source.droppableId !== destination.droppableId) {
      setCalendar(prev => {
        const newCalendar = [...prev];
        const sourceDay = newCalendar.find(d => d.id === source.droppableId);
        const destDay = newCalendar.find(d => d.id === destination.droppableId);

        if (sourceDay && destDay) {
          const [movedItem] = sourceDay.recipes.splice(source.index, 1);
          // Check for duplicate
          if (!destDay.recipes.find(r => r.id === movedItem.id)) {
            destDay.recipes.splice(destination.index, 0, movedItem);
          } else {
            // Revert if duplicate
            sourceDay.recipes.splice(source.index, 0, movedItem);
          }
        }
        return newCalendar;
      });
    } else {
      // Reordering within same day
      setCalendar(prev => {
        const newCalendar = [...prev];
        const day = newCalendar.find(d => d.id === source.droppableId);
        if (day) {
          const [movedItem] = day.recipes.splice(source.index, 1);
          day.recipes.splice(destination.index, 0, movedItem);
        }
        return newCalendar;
      });
    }
  };

  const removeRecipeFromCalendar = (dayId: string, recipeId: number) => {
    setCalendar((prev) =>
      prev.map((day) => {
        if (day.id === dayId) {
          return { ...day, recipes: day.recipes.filter(r => r.id !== recipeId) };
        }
        return day;
      })
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meal Calendar</h1>
        <p className="text-slate-500 mt-2 text-lg">Plan your week and easily reschedule meals by dragging them.</p>
      </div>

      {/* Calendar takes full width */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <MealCalendar calendar={calendar} onRemove={removeRecipeFromCalendar} />
      </DragDropContext>

      {/* Grocery List below calendar */}
      <div className="max-w-md">
        <GroceryList calendar={calendar} />
      </div>
    </div>
  );
}
