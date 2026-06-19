import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ChefHat, Calendar, Heart, LogOut, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-xl z-20 text-slate-300">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow-indigo-500/20 shadow-lg">
            <ChefHat className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            PantrySync
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Menu
          </div>
          <NavLink 
            to="/dashboard/pantry" 
            className={({ isActive }) => 
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm ${
                isActive ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Utensils size={18} />
            <span>Pantry & Recipes</span>
          </NavLink>
          
          <NavLink 
            to="/dashboard/calendar" 
            className={({ isActive }) => 
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm ${
                isActive ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Calendar size={18} />
            <span>Meal Calendar</span>
          </NavLink>

          <NavLink 
            to="/dashboard/favorites" 
            className={({ isActive }) => 
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm ${
                isActive ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Heart size={18} />
            <span>Favorites</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="px-3 py-2 mb-2 text-xs text-slate-400 font-medium truncate">
            {user?.email}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 w-full"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
