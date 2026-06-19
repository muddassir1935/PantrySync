import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import type { Recipe } from '../data/mockRecipes';
import { mockRecipes } from '../data/mockRecipes';
import type { CalendarDay } from '../App';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const INITIAL_CALENDAR: CalendarDay[] = [
  { id: 'mon', name: 'Monday', recipes: [] },
  { id: 'tue', name: 'Tuesday', recipes: [] },
  { id: 'wed', name: 'Wednesday', recipes: [] },
  { id: 'thu', name: 'Thursday', recipes: [] },
  { id: 'fri', name: 'Friday', recipes: [] },
  { id: 'sat', name: 'Saturday', recipes: [] },
  { id: 'sun', name: 'Sunday', recipes: [] },
];

interface PantryContextType {
  userIngredients: string[];
  setUserIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  recipes: Recipe[];
  loadingRecipes: boolean;
  calendar: CalendarDay[];
  setCalendar: React.Dispatch<React.SetStateAction<CalendarDay[]>>;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

export function PantryProvider({ children }: { children: ReactNode }) {
  const [userIngredients, setUserIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [calendar, setCalendar] = useState<CalendarDay[]>(INITIAL_CALENDAR);
  const [isCalendarLoaded, setIsCalendarLoaded] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchRecipes = async () => {
      if (userIngredients.length === 0) {
        setRecipes([]);
        return;
      }
      setLoadingRecipes(true);
      try {
        const ingredientsString = userIngredients.join(',');
        const response = await axios.get(`/api/recipes/findByIngredients?ingredients=${ingredientsString}`);
        setRecipes(response.data);
      } catch (error: any) {
        console.error('Error fetching recipes:', error);
        if (error.response?.status === 500 || error.response?.status === 402) {
          toast.error('Recipe API limit reached! Showing sample recipes instead.', { duration: 5000 });
          setRecipes(mockRecipes);
        }
      } finally {
        setLoadingRecipes(false);
      }
    };

    const timeoutId = setTimeout(fetchRecipes, 500);
    return () => clearTimeout(timeoutId);
  }, [userIngredients]);

  // Fetch calendar on mount
  useEffect(() => {
    const fetchCalendar = async () => {
      if (!token) {
        setIsCalendarLoaded(true);
        return;
      }
      try {
        const response = await axios.get('/api/calendar', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.calendar) {
          // Auto-clear logic: empty out days that are strictly before today's day of week
          const currentDayIndex = new Date().getDay();
          const todayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1; // Map Sunday(0) to 6, Mon(1) to 0, etc.
          
          const updatedCalendar = response.data.calendar.map((day: CalendarDay, index: number) => {
            if (index < todayIndex) {
              return { ...day, recipes: [] };
            }
            return day;
          });
          setCalendar(updatedCalendar);
        }
      } catch (error) {
        console.error('Failed to fetch calendar', error);
      } finally {
        setIsCalendarLoaded(true);
      }
    };
    fetchCalendar();
  }, [token]);

  // Auto-sync calendar to backend on change
  useEffect(() => {
    if (!isCalendarLoaded || !token) return;
    const saveCalendar = async () => {
      try {
        await axios.put('/api/calendar', 
          { calendar },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to sync calendar to database', error);
      }
    };
    
    // Debounce the save slightly to avoid spamming the backend during drag-and-drop
    const timeoutId = setTimeout(saveCalendar, 500);
    return () => clearTimeout(timeoutId);
  }, [calendar, isCalendarLoaded, token]);

  return (
    <PantryContext.Provider value={{ userIngredients, setUserIngredients, recipes, loadingRecipes, calendar, setCalendar }}>
      {children}
    </PantryContext.Provider>
  );
}

export function usePantry() {
  const context = useContext(PantryContext);
  if (context === undefined) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
}
