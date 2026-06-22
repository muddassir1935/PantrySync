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

      {/* 7-column grid for all days in a single row on large screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {calendar.map((day) => (
          <Droppable key={day.id} droppableId={day.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex flex-col min-h-[180px] rounded-xl border transition-all duration-200 overflow-hidden ${
                  snapshot.isDraggingOver
                    ? 'border-indigo-400 bg-indigo-50/60 shadow-md shadow-indigo-100'
                    : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
                }`}
              >
                {/* Day Header - compact and aligned */}
                <div className={`px-3 py-2.5 border-b flex items-center justify-between ${
                  snapshot.isDraggingOver 
                    ? 'bg-indigo-100/60 border-indigo-200' 
                    : 'bg-slate-100/80 border-slate-200'
                }`}>
                  <h3 className="font-semibold text-slate-700 text-xs uppercase tracking-wider leading-none">
                    {day.name.substring(0, 3)}
                  </h3>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                    day.recipes.length > 0 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'bg-slate-200/80 text-slate-400'
                  }`}>
                    {day.recipes.length}
                  </span>
                </div>
                
                {/* Meals container */}
                <div className="flex-1 p-2 space-y-2">
                  {day.recipes.map((recipe, index) => (
                    <Draggable key={`${day.id}-${recipe.id}`} draggableId={`${day.id}-${recipe.id}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="relative group bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing"
                        >
                          <img 
                            src={recipe.image} 
                            alt={recipe.title} 
                            className="w-full aspect-[3/2] rounded-md object-cover mb-1.5" 
                          />
                          <span className="text-[11px] font-medium text-slate-700 line-clamp-2 leading-tight block px-0.5">
                            {recipe.title}
                          </span>
                          <button 
                            onClick={() => onRemove(day.id, recipe.id)}
                            className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {day.recipes.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 py-4">
                      <Calendar size={20} className="mb-1 opacity-40" />
                      <span className="text-[10px] font-medium text-slate-300">Drop here</span>
                    </div>
                  )}
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
