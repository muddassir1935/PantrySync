import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface IngredientManagerProps {
  onIngredientsChange: (ingredients: string[]) => void;
}

export function IngredientManager({ onIngredientsChange }: IngredientManagerProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    
    if (trimmedInput && !ingredients.includes(trimmedInput.toLowerCase())) {
      const newIngredients = [...ingredients, trimmedInput.toLowerCase()];
      setIngredients(newIngredients);
      onIngredientsChange(newIngredients);
      setInputValue('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    const newIngredients = ingredients.filter(i => i !== ingredientToRemove);
    setIngredients(newIngredients);
    onIngredientsChange(newIngredients);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h2 className="text-xl font-bold tracking-tight mb-5 text-slate-900">My Pantry</h2>
      
      {/* Input Form */}
      <form onSubmit={handleAddIngredient} className="relative mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add an ingredient..."
          className="w-full pl-4 pr-12 py-2.5 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-slate-900 shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-md transition-colors shadow-sm"
        >
          <Plus size={18} />
        </button>
      </form>

      {/* Visual List of Ingredients */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {ingredients.length === 0 ? (
          <div className="text-center text-slate-500 mt-8">
            <p>Your pantry is empty.</p>
            <p className="text-sm mt-1">Add some ingredients to see what you can cook!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ingredients.map((ingredient) => (
              <li
                key={ingredient}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 group transition-all hover:border-slate-200 hover:bg-slate-100"
              >
                <span className="capitalize font-medium text-sm">{ingredient}</span>
                <button
                  onClick={() => handleRemoveIngredient(ingredient)}
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                  aria-label={`Remove ${ingredient}`}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
