import React, { useMemo, useState } from 'react';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';
import type { CalendarDay } from '../../App';
import type { Ingredient } from '../../data/mockRecipes';

interface GroceryListProps {
  calendar: CalendarDay[];
}

export function GroceryList({ calendar }: GroceryListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const groceryItems = useMemo(() => {
    const itemsMap = new Map<string, Ingredient & { quantityNeeded: number }>();

    calendar.forEach(day => {
      day.recipes.forEach(recipe => {
        if (recipe.missedIngredients) {
          recipe.missedIngredients.forEach(ing => {
            const key = ing.name.toLowerCase();
            if (itemsMap.has(key)) {
              const existing = itemsMap.get(key)!;
              itemsMap.set(key, { ...existing, quantityNeeded: existing.quantityNeeded + ing.amount });
            } else {
              itemsMap.set(key, { ...ing, quantityNeeded: ing.amount });
            }
          });
        }
      });
    });

    return Array.from(itemsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-6 border-b border-slate-100 pb-4">
        <ShoppingCart className="text-indigo-600" size={24} />
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Grocery List</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {groceryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-70">
            <CheckCircle2 size={48} className="mb-4 text-emerald-500" />
            <p className="text-center font-medium">You have everything you need!</p>
            <p className="text-sm text-center mt-1">Schedule recipes with missing ingredients to build your list.</p>
          </div>
        ) : (
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
      </div>
    </div>
  );
}
