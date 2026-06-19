import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { X, Clock, Users, Flame, Heart, CheckCircle2, Calendar } from 'lucide-react';
import type { Recipe } from '../../data/mockRecipes';
import toast from 'react-hot-toast';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

interface RecipeDetails {
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  summary: string;
  instructions: string;
  extendedIngredients: {
    id: number;
    original: string;
  }[];
}

import { usePantry } from '../../context/PantryContext';

export function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  const [details, setDetails] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const { token } = useAuth();
  const { setCalendar } = usePantry();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`/api/recipes/${recipe.id}/information`);
        setDetails(response.data);
      } catch (error: any) {
        console.error('Failed to fetch recipe details', error);
        if (error.response?.status === 500 || error.response?.status === 402) {
          toast.error('Recipe API limit reached! Showing sample details instead.', { duration: 5000 });
          setDetails({
            readyInMinutes: 45,
            servings: 4,
            sourceUrl: "https://example.com",
            summary: "This is a sample recipe summary because the API quota was reached.",
            instructions: "<ol><li>Gather your ingredients.</li><li>Cook them with love.</li><li>Enjoy your meal!</li></ol>",
            extendedIngredients: [
              { id: 1, original: "Sample Ingredient 1" },
              { id: 2, original: "Sample Ingredient 2" },
            ]
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [recipe.id]);

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

  const handleSaveToggle = async () => {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header Image */}
        <div className="relative h-64 w-full bg-gray-100">
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
          >
            <X size={20} />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 pointer-events-none">
            <h2 className="text-3xl font-bold text-white">{recipe.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : details ? (
            <div className="space-y-8">
              
              {/* Stats Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-xl gap-4">
                <div className="flex space-x-6 text-slate-700">
                  <div className="flex items-center space-x-2">
                    <Clock size={20} className="text-indigo-500" />
                    <span className="font-semibold">{details.readyInMinutes} mins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users size={20} className="text-indigo-500" />
                    <span className="font-semibold">{details.servings} servings</span>
                  </div>
                </div>
                
                  <div className="flex space-x-3 w-full sm:w-auto relative">
                  {/* Schedule Dropdown Container */}
                  <div>
                    <button
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                      <Calendar size={18} />
                      <span>Schedule</span>
                    </button>
                    
                    {/* Schedule Menu */}
                    {showSchedule && (
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-slate-100 p-2 w-48 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="text-xs font-semibold text-slate-500 mb-2 px-2 uppercase tracking-wider">Select Day</div>
                        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                          <button
                            key={day}
                            onClick={() => {
                              setCalendar(prev => prev.map(d => {
                                if (d.id === day && !d.recipes.find(r => r.id === recipe.id)) {
                                  return { ...d, recipes: [...d.recipes, recipe] };
                                }
                                return d;
                              }));
                              setShowSchedule(false);
                              toast.success(`Added to ${day.charAt(0).toUpperCase() + day.slice(1)}!`);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-md transition-colors capitalize font-medium"
                          >
                            {day === 'thu' ? 'Thursday' : day === 'tue' ? 'Tuesday' : day === 'wed' ? 'Wednesday' : day === 'sat' ? 'Saturday' : day === 'sun' ? 'Sunday' : day === 'mon' ? 'Monday' : 'Friday'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSaveToggle}
                    disabled={saving}
                    className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${
                      saved 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <Heart size={18} className={`${saving ? 'animate-pulse' : ''} ${saved ? 'fill-current' : ''}`} />
                    <span>{saved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Ingredients */}
                <div className="md:col-span-1">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-4 flex items-center">
                    <Flame className="text-indigo-500 mr-2" /> Ingredients
                  </h3>
                  <ul className="space-y-3">
                    {details.extendedIngredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="w-1.5 h-1.5 mt-2 rounded-full bg-indigo-400 flex-shrink-0" />
                        <span className="capitalize">{ing.original}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Instructions</h3>
                  <div 
                    className="prose prose-indigo max-w-none text-slate-700 prose-li:my-1"
                    dangerouslySetInnerHTML={{ __html: details.instructions || details.summary }}
                  />
                  
                  {details.sourceUrl && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <a 
                        href={details.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 font-medium underline"
                      >
                        Read full original recipe
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">Failed to load recipe information.</div>
          )}
        </div>
      </div>
    </div>
  );
}
