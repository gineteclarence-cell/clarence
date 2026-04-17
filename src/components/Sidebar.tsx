import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, FileCheck, LogOut, Coffee, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  role: 'Owner' | 'Staff';
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, role }) => {
  const managerItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales Tracking', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'test-cases', label: 'Test Cases', icon: FileCheck },
  ];

  const staffItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales Point (POS)', icon: ShoppingCart },
    { id: 'attendance', label: 'My Attendance', icon: Clock },
    { id: 'test-cases', label: 'Compliance', icon: FileCheck },
  ];

  const menuItems = role === 'Owner' ? managerItems : staffItems;

  return (
    <div className="w-64 bg-primary text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
          <Coffee className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">MABI</h1>
          <p className="text-xs text-white/60">Sip & Bites</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-left",
              activeTab === item.id 
                ? "bg-accent text-white shadow-lg" 
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              activeTab === item.id ? "text-white" : "text-white/60 group-hover:text-white"
            )} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-red-500/20 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
