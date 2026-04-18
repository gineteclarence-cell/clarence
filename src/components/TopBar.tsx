import React, { useState, useEffect } from 'react';
import { Branch, User, AppNotification } from '../types';
import { Wifi, WifiOff, Bell, User as UserIcon, ChevronDown, CheckCircle2, AlertTriangle, Info, Clock, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { NOTIFICATIONS as INITIAL_NOTIFICATIONS } from '../data/mockData';
import { formatDistanceToNow } from 'date-fns';

interface TopBarProps {
  user: User | null;
  selectedBranch: Branch;
  setSelectedBranch: (branch: Branch) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  user, 
  selectedBranch, 
  setSelectedBranch, 
  isOffline, 
  onToggleOffline,
  onMenuClick
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Load notifications from localStorage or use defaults
    const saved = localStorage.getItem('mabi_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
      localStorage.setItem('mabi_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('mabi_notifications', JSON.stringify(updated));
  };

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('mabi_notifications', JSON.stringify(updated));
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-2 lg:gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
        >
          <div className="w-5 h-5 flex flex-col justify-center gap-1">
            <div className="w-full h-0.5 bg-current rounded-full" />
            <div className="w-full h-0.5 bg-current rounded-full" />
            <div className="w-full h-0.5 bg-current rounded-full" />
          </div>
        </button>

        <h2 className="text-base lg:text-xl font-black text-black capitalize tracking-tight line-clamp-1">
          {selectedBranch === 'All' ? 'Centralized Overview' : selectedBranch}
        </h2>
        
        <div className="hidden sm:flex bg-black/5 rounded-xl p-1">
          {(['All', 'Branch 1', 'Branch 2'] as Branch[]).map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBranch(b)}
              className={cn(
                "px-3 lg:px-4 py-1.5 rounded-lg text-[10px] lg:text-sm font-black transition-all",
                selectedBranch === b 
                  ? "bg-primary text-black shadow-sm" 
                  : "text-black/40 hover:text-black"
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2 lg:gap-6">
        <button 
          onClick={onToggleOffline}
          className={cn(
            "flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 rounded-full text-[8px] lg:text-[10px] font-black tracking-tighter transition-all border shadow-sm",
            isOffline 
              ? "bg-orange-50 text-orange-600 border-orange-200" 
              : "bg-teal-50 text-teal-600 border-teal-200"
          )}
        >
          {isOffline ? <WifiOff className="w-3 lg:w-3.5 h-3 lg:h-3.5" /> : <Wifi className="w-3 lg:w-3.5 h-3 lg:h-3.5" />}
          <span className="hidden xs:inline">{isOffline ? 'OFFLINE MODE' : 'STORE SYNC ACTIVE'}</span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors relative group"
          >
            <Bell className={cn("w-5 h-5 transition-colors", showNotifications ? "text-primary" : "text-gray-400 group-hover:text-black")} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-[-1]" 
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-black text-primary hover:underline uppercase"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {notifications.map((n) => (
                          <div 
                            key={n.id}
                            className={cn(
                              "p-4 hover:bg-gray-50 transition-all cursor-pointer relative group",
                              !n.read && "bg-primary/5"
                            )}
                          >
                            <div className="flex gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
                                n.type === 'warning' ? "bg-orange-50 text-orange-500" :
                                n.type === 'success' ? "bg-green-50 text-green-500" :
                                "bg-blue-50 text-blue-500"
                              )}>
                                {n.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                 n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                 <Info className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <p className="font-bold text-sm text-gray-900 line-clamp-1">{n.title}</p>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-gray-300" />
                                    <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                                      {formatDistanceToNow(new Date(n.time), { addSuffix: true })}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                                {!n.read && (
                                  <button 
                                    onClick={(e) => markAsRead(n.id, e)}
                                    className="mt-2 text-[10px] font-black text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Check className="w-3 h-3" /> MARK AS READ
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No new updates</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">MABI SIP & BITES SYSTEM</p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-900 leading-none">{user?.name}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{user?.role}</p>
          </div>
          <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-xl bg-primary flex items-center justify-center text-black border border-black/5 shadow-inner">
            <UserIcon className="w-4 lg:w-5 h-4 lg:h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
