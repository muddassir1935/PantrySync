import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { usePantry } from '../../context/PantryContext';
import { Heart, CheckCircle2, AlertCircle, Calendar as CalendarIcon, Info, Eye } from 'lucide-react';
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
      <div className="bg-white rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 border border-slate-200/80 flex flex-col h-full group">
        {/* Image Section - fixed aspect ratio */}
        <div 
          className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-slate-100"
          onClick={() => setIsModalOpen(true)}
        >
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495195134817-a1a2807f9c1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
            }}
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          {/* Favorite button */}
          <button 
            onClick={handleSaveToggle}
            disabled={saving}
            className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center backdrop-blur-sm rounded-full transition-all duration-300 z-10 ${
              saved 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-100' 
                : 'bg-white/80 text-slate-400 hover:bg-white hover:text-red-500 shadow-md'
            }`}
          >
            <Heart size={16} className={saved ? 'fill-current' : ''} />
          </button>

          {/* Quick view label on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
              <Eye size={14} />
              Quick View
            </span>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1">
          {/* Title */}
          <h3 
            className="text-[15px] font-semibold text-slate-800 mb-3 line-clamp-2 min-h-[2.75rem] leading-snug cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            {recipe.title}
          </h3>
          
          {/* Ingredient Badges - inline horizontal pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <CheckCircle2 size={12} className="flex-shrink-0" />
              {recipe.usedIngredientCount} in pantry
            </span>
            
            {recipe.missedIngredientCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                <AlertCircle size={12} className="flex-shrink-0" />
                {recipe.missedIngredientCount} missing
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 size={12} className="flex-shrink-0" />
                All available
              </span>
            )}
          </div>
          
          {/* Spacer pushes buttons to bottom */}
          <div className="mt-auto" />

          {/* Action Buttons - clean bottom bar */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-medium text-sm shadow-sm shadow-indigo-600/10"
            >
              <Info size={14} />
              <span>View Recipe</span>
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSchedule(!showSchedule);
                }}
                className="flex items-center justify-center w-9 h-9 bg-slate-100 text-slate-500 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                title="Schedule meal"
              >
                <CalendarIcon size={16} />
              </button>

              {showSchedule && (
                <div className="absolute right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 w-40 z-50 animate-in fade-in zoom-in">
                  <div className="text-[10px] font-semibold text-slate-400 mb-1.5 px-2.5 pt-1 uppercase tracking-wider">Schedule for</div>
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
                      className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors capitalize font-medium"
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
      
      {isModalOpen && <RecipeModal recipe={recipe} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
