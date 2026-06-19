import React from 'react';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '../../data/mockRecipes';
import { ChefHat } from 'lucide-react';

interface RecipeGridProps {
  recipes: Recipe[];
}

export function RecipeGrid({ recipes }: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <ChefHat size={48} className="mb-4 text-gray-300" />
        <p className="text-lg">No recipes found.</p>
        <p className="text-sm">Try adding some ingredients to your pantry!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes.map((recipe) => (
        <div key={recipe.id.toString()} className="h-full">
          <RecipeCard recipe={recipe} />
        </div>
      ))}
    </div>
  );
}
