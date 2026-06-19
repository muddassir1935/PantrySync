import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, X } from 'lucide-react';
import type { CalendarDay } from '../../App';

interface MealCalendarProps {
  calendar: CalendarDay[];
  onRemove: (dayId: string, recipeId: number) => void;
}

export function MealCalendar({ calendar, onRemove }: MealCalendarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="text-indigo-600" size={24} />
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Weekly Meal Plan</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {calendar.map((day) => (
          <Droppable key={day.id} droppableId={day.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex flex-col min-h-[160px] p-4 rounded-xl border-2 transition-colors ${
                  snapshot.isDraggingOver
                    ? 'border-indigo-400 bg-indigo-50/50'
                    : 'border-dashed border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                  <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
                    {day.name}
                  </h3>
                  <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-full shadow-sm border border-slate-100">
                    {day.recipes.length} {day.recipes.length === 1 ? 'meal' : 'meals'}
                  </span>
                </div>
                
                <div className="flex-1 space-y-3">
                  {day.recipes.map((recipe, index) => (
                    <Draggable key={`${day.id}-${recipe.id}`} draggableId={`${day.id}-${recipe.id}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="relative group bg-white p-2.5 rounded-lg shadow-sm border border-slate-100 flex items-center space-x-3 hover:shadow-md hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing"
                        >
                          <img src={recipe.image} alt={recipe.title} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                          <span className="text-sm font-semibold text-slate-800 line-clamp-2 pr-4">{recipe.title}</span>
                          <button 
                            onClick={() => onRemove(day.id, recipe.id)}
                            className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </div>
  );
}
