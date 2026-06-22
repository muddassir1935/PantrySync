import React, { useMemo, useState } from 'react';
import { ShoppingCart, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { CalendarDay } from '../../App';
import type { Ingredient } from '../../data/mockRecipes';

interface GroceryListProps {
  calendar: CalendarDay[];
}

export function GroceryList({ calendar }: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const { groceryItems, recipesWithUnknownMissing } = useMemo(() => {
    const itemsMap = new Map<string, Ingredient & { quantityNeeded: number }>();
    const unknownMissing: { title: string; count: number }[] = [];

    calendar.forEach(day => {
      day.recipes.forEach(recipe => {
        if (recipe.missedIngredients && recipe.missedIngredients.length > 0) {
          recipe.missedIngredients.forEach(ing => {
            const key = ing.name.toLowerCase();
            if (itemsMap.has(key)) {
              const existing = itemsMap.get(key)!;
              itemsMap.set(key, { ...existing, quantityNeeded: existing.quantityNeeded + ing.amount });
            } else {
              itemsMap.set(key, { ...ing, quantityNeeded: ing.amount });
            }
          });
        } else if (recipe.missedIngredientCount > 0) {
          // Recipe has missing ingredients but no detailed list
          unknownMissing.push({ title: recipe.title, count: recipe.missedIngredientCount });
        }
      });
    });

    return {
      groceryItems: Array.from(itemsMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      recipesWithUnknownMissing: unknownMissing
    };
  }, [calendar]);

  const toggleItem = (id: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalScheduled = calendar.reduce((sum, day) => sum + day.recipes.length, 0);
  const hasNoMeals = totalScheduled === 0;
  const hasNoMissing = groceryItems.length === 0 && recipesWithUnknownMissing.length === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-6 border-b border-slate-100 pb-4">
        <ShoppingCart className="text-indigo-600" size={24} />
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Grocery List</h2>
        {groceryItems.length > 0 && (
          <span className="ml-auto text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
            {groceryItems.length} items
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {hasNoMeals ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-70 py-8">
            <CheckCircle2 size={48} className="mb-4 text-emerald-500" />
            <p className="text-center font-medium">No meals scheduled yet</p>
            <p className="text-sm text-center mt-1">Add recipes to your meal plan to generate a grocery list.</p>
          </div>
        ) : hasNoMissing ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-70 py-8">
            <CheckCircle2 size={48} className="mb-4 text-emerald-500" />
            <p className="text-center font-medium">You have everything you need!</p>
            <p className="text-sm text-center mt-1">All scheduled recipes can be made with your pantry ingredients.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groceryItems.length > 0 && (
              <ul className="space-y-3">
                {groceryItems.map((item) => {
                  const isChecked = checkedItems.has(item.id);
                  return (
                    <li 
                      key={item.id} 
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
                        isChecked 
                          ? 'bg-slate-100 border-slate-200 opacity-50' 
                          : 'bg-slate-50 border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-sm'
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => {}} // Controlled by the li onClick
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-none"
                      />
                      <div className={`flex-1 flex justify-between items-center transition-all duration-300 ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        <span className="font-medium capitalize text-sm">{item.name}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${isChecked ? 'bg-transparent text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                          {Math.round(item.quantityNeeded * 10) / 10} {item.unit}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {recipesWithUnknownMissing.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Additional items needed</span>
                </div>
                <ul className="space-y-1.5">
                  {recipesWithUnknownMissing.map((r, idx) => (
                    <li key={idx} className="text-sm text-amber-800 flex justify-between items-center">
                      <span className="font-medium line-clamp-1">{r.title}</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ml-2">
                        {r.count} missing
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-amber-600 mt-2">View these recipes for full ingredient details.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
