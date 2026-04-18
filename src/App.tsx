import { useState, useEffect } from 'react';
import { Branch, User } from './types';
import { cn } from './lib/utils';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Inventory from './components/Inventory';
import Staff from './components/Staff';
import Category from './components/Category';
import Help from './components/Help';
import StaffDashboard from './components/StaffDashboard';
import StaffPOS from './components/StaffPOS';
import StaffInventory from './components/StaffInventory';
import LandingPage from './components/LandingPage';
import { useOffline } from './hooks/useOffline';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBranch, setSelectedBranch] = useState<Branch>('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOffline, toggleOffline } = useOffline();
  
  // Persistent Auth State
  useEffect(() => {
    const savedUser = localStorage.getItem('mabi_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const handleTabChange = (e: any) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('mabi_user', JSON.stringify(newUser));
    localStorage.setItem('current_staff', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mabi_user');
    localStorage.removeItem('current_staff');
    setActiveTab('dashboard');
  };

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    // Owner specific views
    if (user.role === 'Owner') {
      switch (activeTab) {
        case 'dashboard': return <Dashboard branch={selectedBranch} />;
        case 'sales': return <Sales branch={selectedBranch} />;
        case 'inventory': return <Inventory isOffline={isOffline} branch={selectedBranch} />;
        case 'staff': return <Staff branch={selectedBranch} />;
        case 'category': return <Category branch={selectedBranch} />;
        case 'help': return <Help />;
        default: return <Dashboard branch={selectedBranch} />;
      }
    }
    
    // Staff specific views
    switch (activeTab) {
      case 'dashboard': 
      case 'attendance':
        return <StaffDashboard user={user} isOffline={isOffline} onToggleOffline={toggleOffline} activeTab={activeTab} />;
      case 'sales':
        return <StaffPOS user={user} />;
      case 'inventory':
        return <StaffInventory user={user} />;
      case 'category':
        return <Category branch={user.branch} />;
      case 'help':
        return <Help />;
      default: return <StaffDashboard user={user} isOffline={isOffline} onToggleOffline={toggleOffline} />;
    }
  };

  return (
    <div className="flex bg-app-bg min-h-screen font-sans overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <main className={cn(
        "flex-1 min-h-screen flex flex-col transition-all duration-300",
        "lg:ml-64"
      )}>
        <TopBar 
          user={user} 
          selectedBranch={selectedBranch} 
          setSelectedBranch={setSelectedBranch} 
          isOffline={isOffline}
          onToggleOffline={toggleOffline}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <div className="p-4 lg:p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + selectedBranch}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight capitalize">
                  {activeTab.replace('-', ' ')}
                </h2>
                <p className="text-gray-500 font-medium mt-1">
                  Mabi Sip & Bites Centralized Monitoring System
                </p>
              </div>
              
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
