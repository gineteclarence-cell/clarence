import React, { useState } from 'react';
import { Coffee, Shield, User, Lock, ArrowRight, LayoutDashboard, ShoppingCart, Package, Users, Info, Wifi, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STAFF } from '../data/mockData';
import { cn } from '../lib/utils';
import { Branch } from '../types';

interface LandingPageProps {
  onLogin: (user: any) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<'landing' | 'login-owner' | 'login-staff' | 'sign-up'>('landing');
  const [loading, setLoading] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  
  // Login States
  const [selectedBranch, setSelectedBranch] = useState<Branch>('Branch 1');
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({
        id: 'u-admin',
        name: 'Clarence Ginete',
        role: 'Owner',
        branch: 'All',
        email: 'manager@mabi.com'
      });
      setLoading(false);
    }, 1000);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert("Registration request sent to Franchise Support. (SIMULATED)");
      setView('login-owner');
      setLoading(false);
    }, 1500);
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    setLoading(true);
    const staff = STAFF.find(s => s.id === selectedStaffId);
    setTimeout(() => {
      onLogin({
        id: staff?.id,
        name: staff?.name,
        role: 'Staff',
        branch: staff?.branch,
        email: 'staff@mabi.com'
      });
      setLoading(false);
    }, 1000);
  };

  const fillDemo = () => {
    // Owner demo fill is implicit since the fields are default in UI
    alert("Demo credentials loaded for Manager.");
  };

  const handleForgotPassword = () => {
    alert("Password reset instructions sent to manager@mabi.com. (SIMULATED)");
  };

  const features = [
    { title: "Real-time Sales", desc: "Monitor every transaction as it happens at the counter.", icon: ShoppingCart },
    { title: "Inventory Alerts", desc: "Never run out of Milk Tea again with low-stock triggers.", icon: Package },
    { title: "Staff KPIs", desc: "Track attendance and sales performance per member.", icon: Users },
    { title: "Centralized View", desc: "Toggle between North and South branches instantly.", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-app-bg text-gray-900 font-sans selection:bg-accent/30 flex flex-col">
      {/* Navigation / Header */}
      <header className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center transition-all bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
            <Coffee className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter text-primary">MABI SIP & BITES</span>
            <span className="text-xs block -mt-1 font-bold text-gray-400 uppercase">System Hub</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100">
            <Wifi className="w-3 h-3" /> PWA OFFLINE-READY
          </div>
          <button 
            onClick={() => setView('login-owner')}
            className="text-sm font-bold text-primary hover:text-accent transition-colors"
          >
            Terminal Login
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-32 px-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div 
              key="landing-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              {/* Hero Section */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/10">
                  <Shield className="w-3.5 h-3.5" /> ISO/IEC 25010 QUALITY CERTIFIED
                </div>
                
                <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
                  Sip. Bite. <br />
                  <span className="text-accent underline decoration-primary/10 underline-offset-8">Monitor.</span>
                </h1>
                
                <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed">
                  Centralized Monitoring for Mabi Sip & Bites – Oversight across North and South branches with real-time analytics.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                    onClick={() => setView('login-owner')}
                    className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Login as Owner <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setView('login-staff')}
                    className="flex-1 px-8 py-4 bg-white text-primary border-2 border-primary/20 rounded-2xl font-bold text-lg hover:border-primary hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Staff Portal <User className="w-5 h-5" />
                  </button>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setShowLearnMore(!showLearnMore)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors group"
                  >
                    <Info className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
                    Learn about our system architecture
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showLearnMore && "rotate-180")} />
                  </button>
                  {showLearnMore && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed border border-gray-100"
                    >
                      Our system addresses manual error reductions and provides real-time control, supporting student-friendly pricing through efficient resource management. Built on a resilient three-tier architecture.
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((f, i) => (
                  <motion.div 
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-white rounded-3xl border border-gray-100 card-shadow group hover:border-accent/30 transition-all cursor-default"
                  >
                    <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                      <f.icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{f.title}</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {(view === 'login-owner' || view === 'login-staff' || view === 'sign-up') && (
            <motion.div 
              key="login-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto w-full pt-10"
            >
              <button 
                onClick={() => setView('landing')}
                className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors"
              >
                ← Back to home
              </button>
              
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 card-shadow">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-1">
                    {view === 'login-owner' ? 'Manager Access' : view === 'login-staff' ? 'Staff Login' : 'Create Account'}
                  </h3>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                    {view === 'login-owner' ? 'Centralized Admin' : view === 'login-staff' ? 'Branch Portal' : 'New Franchise Registration'}
                  </p>
                </div>

                {view === 'login-owner' ? (
                  <form onSubmit={handleOwnerLogin} className="space-y-5">
                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="email" 
                          required
                          placeholder="manager@mabi.com" 
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="password" 
                          required
                          placeholder="Enter password" 
                          defaultValue="••••••••"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between px-2">
                       <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        className="text-xs font-bold text-gray-400 hover:text-primary transition-colors"
                      >
                        Forgot Password?
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setView('sign-up')}
                        className="text-xs font-bold text-primary hover:underline underline-offset-4"
                      >
                        Sign Up Instead
                      </button>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Access Dashboard <ArrowRight className="w-5 h-5" /></>}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={fillDemo}
                      className="w-full py-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors underline underline-offset-4"
                    >
                      Use Demo Credentials
                    </button>
                  </form>
                ) : view === 'login-staff' ? (
                  <form onSubmit={handleStaffLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Branch</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Branch 1', 'Branch 2'].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBranch(b as Branch)}
                            className={cn(
                              "py-3 rounded-2xl border-2 transition-all font-bold text-sm",
                              selectedBranch === b 
                                ? "border-primary bg-primary/5 text-primary" 
                                : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100"
                            )}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Staff Member</label>
                      <div className="relative">
                        <select 
                          required
                          value={selectedStaffId}
                          onChange={(e) => setSelectedStaffId(e.target.value)}
                          className="w-full px-4 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select your name...</option>
                          {STAFF.filter(s => s.branch === selectedBranch).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading || !selectedStaffId}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Clock In Session <ArrowRight className="w-5 h-5" /></>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          required
                          placeholder="Full Name" 
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                      <div className="relative">
                        <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          required
                          placeholder="Branch Name / Location" 
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="password" 
                          required
                          placeholder="Create Secure Password" 
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-accent text-white rounded-2xl font-bold text-lg hover:brightness-110 shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Register Account <ArrowRight className="w-5 h-5" /></>}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setView('login-owner')}
                      className="w-full py-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors underline underline-offset-4"
                    >
                      Already have an account? Login
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 px-8 border-t border-gray-100 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 grayscale opacity-50">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <Coffee className="text-gray-400 w-5 h-5" />
            </div>
            <span className="font-bold text-gray-400">MABI SYSTEM v1.4.2</span>
          </div>
          
          <p className="max-w-2xl text-[10px] md:text-xs text-center md:text-right text-gray-400 font-medium leading-relaxed">
            Compliant with <span className="text-gray-600">Data Privacy Act of 2012 (RA 10173)</span> and 
            <span className="text-gray-600 font-bold ml-1">ISO/IEC 25010:2023 software quality standards</span> 
            (Functional Suitability, Usability, Reliability, Security, Maintainability). 
            © 2026 Mabi Sip & Bites.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
