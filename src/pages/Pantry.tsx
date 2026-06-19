import React from 'react';
import { IngredientManager } from '../components/ingredients/IngredientManager';
import { RecipeGrid } from '../components/recipes/RecipeGrid';
import { usePantry } from '../context/PantryContext';

export function Pantry() {
  const { userIngredients, setUserIngredients, recipes, loadingRecipes } = usePantry();

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Sidebar for Ingredients */}
      <div className="w-full xl:w-80 flex-shrink-0">
        <IngredientManager onIngredientsChange={setUserIngredients} />
      </div>
      
      {/* Main Recipe Grid */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">What you can cook</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Based on the {userIngredients.length} ingredients in your pantry.
          </p>
        </div>
        
        {loadingRecipes ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <RecipeGrid recipes={recipes} />
        )}
      </div>
    </div>
  );
}
