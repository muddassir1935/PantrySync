import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { usePantry } from '../../context/PantryContext';
import { Heart, CheckCircle2, AlertCircle, Calendar as CalendarIcon, Info } from 'lucide-react';
import type { Recipe } from '../../data/mockRecipes';
import { RecipeModal } from './RecipeModal';
import toast from 'react-hot-toast';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  
  const { token } = useAuth();
  const { setCalendar } = usePantry();

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!token) return;
      try {
        const response = await axios.get('/api/recipes/saved', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const isSaved = response.data.some((r: any) => r.recipe_id === recipe.id);
        setSaved(isSaved);
      } catch (error) {
        console.error('Failed to check saved status', error);
      }
    };
    checkSavedStatus();
  }, [recipe.id, token]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent modal opening
    if (!token || saving) return;
    setSaving(true);
    try {
      if (saved) {
        await axios.delete(`/api/recipes/save/${recipe.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSaved(false);
        toast.success('Removed from favorites');
      } else {
        await axios.post('/api/recipes/save', {
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSaved(true);
        toast.success('Saved to favorites!');
      }
    } catch (error) {
      console.error('Failed to toggle recipe', error);
      toast.error('Session expired. Please log in again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 flex flex-col h-full group relative">
        <div className="relative h-48 overflow-hidden cursor-pointer bg-slate-50 flex items-center justify-center" onClick={() => setIsModalOpen(true)}>
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495195134817-a1a2807f9c1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <button 
            onClick={handleSaveToggle}
            disabled={saving}
            className={`absolute top-3 right-3 p-2.5 backdrop-blur-md rounded-full transition-all duration-300 z-10 shadow-sm ${
              saved ? 'bg-red-50 text-red-500 scale-110' : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white hover:scale-110'
            }`}
          >
            <Heart size={18} className={saved ? 'fill-current' : ''} />
          </button>
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem] leading-tight cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setIsModalOpen(true)}>
            {recipe.title}
          </h3>
          
          <div className="mt-auto space-y-2.5 pt-4 border-t border-slate-50">
            <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
              <CheckCircle2 size={16} className="mr-2 flex-shrink-0" />
              <span>Uses {recipe.usedIngredientCount} pantry ingredients</span>
            </div>
            
            {recipe.missedIngredientCount > 0 ? (
              <div className="flex items-center text-sm font-medium text-amber-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                <span>Missing {recipe.missedIngredientCount} ingredients</span>
              </div>
            ) : (
              <div className="flex items-center text-sm font-medium text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <CheckCircle2 size={16} className="mr-2 flex-shrink-0" />
                <span>No missing ingredients!</span>
              </div>
            )}
            
            <div className="mt-5 flex space-x-3 relative pt-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm shadow-sm hover:shadow-md"
              >
                <Info size={16} />
                <span>View Recipe</span>
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSchedule(!showSchedule);
                  }}
                  className="flex items-center justify-center p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-slate-300 transition-colors shadow-sm"
                >
                  <CalendarIcon size={18} />
                </button>

                {showSchedule && (
                  <div className="absolute right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 w-40 z-50 animate-in fade-in zoom-in">
                    <div className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Schedule</div>
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                      <button
                        key={day}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCalendar(prev => prev.map(d => {
                            if (d.id === day && !d.recipes.find(r => r.id === recipe.id)) {
                              return { ...d, recipes: [...d.recipes, recipe] };
                            }
                            return d;
                          }));
                          setShowSchedule(false);
                          toast.success(`Added to ${day.charAt(0).toUpperCase() + day.slice(1)}!`);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors capitalize font-medium"
                      >
                        {day === 'thu' ? 'Thursday' : day === 'tue' ? 'Tuesday' : day === 'wed' ? 'Wednesday' : day === 'sat' ? 'Saturday' : day === 'sun' ? 'Sunday' : day === 'mon' ? 'Monday' : 'Friday'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && <RecipeModal recipe={recipe} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
