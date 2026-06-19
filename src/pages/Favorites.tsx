import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Heart, ExternalLink, Info } from 'lucide-react';
import { RecipeModal } from '../components/recipes/RecipeModal';
import toast from 'react-hot-toast';

export function Favorites() {
  const { token } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  useEffect(() => {
    const fetchSaved = async () => {
      if (!token) return;
      try {
        const response = await axios.get('/api/recipes/saved', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedRecipes(response.data);
      } catch (error) {
        console.error('Failed to fetch saved recipes', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [token]);

  return (
    <div>
      <div className="mb-6 flex items-center space-x-3">
        <Heart className="text-indigo-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Favorites</h1>
          <p className="text-slate-500 mt-1 text-lg">Recipes you've saved for later.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : savedRecipes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
          <Heart size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold tracking-tight text-slate-700">No favorites yet</h2>
          <p className="text-slate-500 mt-2">Explore the Pantry to find and save your favorite meals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300">
              <div className="h-48 overflow-hidden relative cursor-pointer bg-slate-50" onClick={() => setSelectedRecipe({ id: recipe.recipe_id, title: recipe.title, image: recipe.image })}>
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5 flex flex-col flex-1 border-t border-slate-50">
                <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-2 mb-4 min-h-[3rem]">{recipe.title}</h3>
                <div className="mt-auto flex space-x-2 pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => setSelectedRecipe({ id: recipe.recipe_id, title: recipe.title, image: recipe.image })}
                    className="flex-1 flex justify-center items-center space-x-2 bg-indigo-50 text-indigo-700 font-semibold py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                  >
                    <Info size={16} /> <span>View Details</span>
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await axios.delete(`/api/recipes/save/${recipe.recipe_id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setSavedRecipes(prev => prev.filter(r => r.recipe_id !== recipe.recipe_id));
                        toast.success('Removed from favorites');
                      } catch (err) {
                        console.error('Failed to remove recipe', err);
                        toast.error('Failed to remove from favorites.');
                      }
                    }}
                    className="p-2 flex justify-center items-center text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    title="Remove from favorites"
                  >
                    <Heart size={20} className="fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
}
