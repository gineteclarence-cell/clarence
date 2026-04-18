import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, Tag, HelpCircle, LogOut, Coffee, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  role: 'Owner' | 'Staff';
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, role, isOpen, onClose }) => {
  const managerItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales Tracking', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'category', label: 'Category', icon: Tag },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const staffItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'attendance', label: 'My Attendance', icon: Clock },
    { id: 'category', label: 'Category', icon: Tag },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const menuItems = role === 'Owner' ? managerItems : staffItems;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div className={cn(
        "w-64 bg-primary text-gray-900 flex flex-col h-screen fixed left-0 top-0 z-[70] border-r border-black/5 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-black/10">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1 border border-black/5">
            <img 
              src="/src/asset/logo.png" 
              alt="MABI" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://picsum.photos/seed/mabi-logo/100/100";
              }}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1">
            <h1 className="font-black text-xl tracking-tighter leading-tight">MABI</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/60">Sip & Bites</p>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
          >
            <LogOut className="w-4 h-4 rotate-180" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                activeTab === item.id 
                  ? "bg-accent text-white shadow-xl shadow-black/20" 
                  : "text-black/70 hover:bg-black/5 hover:text-black"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                activeTab === item.id ? "text-primary" : "text-black/40 group-hover:text-black transition-colors"
              )} />
              <span className="font-bold whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-black/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-black/60 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
