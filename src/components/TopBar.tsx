import React from 'react';
import { Branch, User } from '../types';
import { Wifi, WifiOff, Bell, User as UserIcon, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface TopBarProps {
  user: User | null;
  selectedBranch: Branch;
  setSelectedBranch: (branch: Branch) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  user, 
  selectedBranch, 
  setSelectedBranch, 
  isOffline, 
  onToggleOffline 
}) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold text-primary capitalize">
          {selectedBranch === 'All' ? 'Centralized Overview' : selectedBranch}
        </h2>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['All', 'Branch 1', 'Branch 2'] as Branch[]).map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBranch(b)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                selectedBranch === b 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-gray-500 hover:text-primary"
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={onToggleOffline}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
            isOffline 
              ? "bg-orange-50 text-orange-600 border-orange-200" 
              : "bg-green-50 text-green-600 border-green-200"
          )}
        >
          {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          {isOffline ? 'OFFLINE MODE' : 'STREET SYNC: ON'}
        </button>
        
        <div className="relative cursor-pointer group">
          <Bell className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <UserIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
