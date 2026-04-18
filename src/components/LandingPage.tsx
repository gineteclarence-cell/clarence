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
  const [view, setView] = useState<'landing' | 'login-owner' | 'staff-auth' | 'login-staff' | 'sign-up'>('landing');
  const [loading, setLoading] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  
  // Login States
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch>('Branch 1');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [staffPass, setStaffPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [staffList, setStaffList] = useState<any[]>([]);

  React.useEffect(() => {
    const loadStaff = () => {
      const saved = localStorage.getItem('mabi_system_staff');
      if (saved) {
        setStaffList(JSON.parse(saved));
      } else {
        setStaffList(STAFF);
      }
    };

    loadStaff();
    window.addEventListener('storage', loadStaff);
    return () => window.removeEventListener('storage', loadStaff);
  }, []);

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
      setView('login-owner');
      setLoading(false);
    }, 1500);
  };

  const handleStaffAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    
    // Simulate API call for portal access
    setTimeout(() => {
      const isValidCode = staffList.some(s => s.accessCode === staffPass);
      if (isValidCode || staffPass === 'mabistaff') {
        setView('login-staff');
      } else {
        setAuthError('Invalid Access Code. Please contact your manager.');
      }
      setLoading(false);
    }, 800);
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    setLoading(true);
    const staff = staffList.find(s => s.id === selectedStaffId);
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
  };

  const handleForgotPassword = () => {
    // Logic for forgot password would go here
  };

  const features = [
    { title: "Real-time Sales", desc: "Monitor every transaction as it happens at the counter.", icon: ShoppingCart },
    { title: "Inventory Alerts", desc: "Never run out of Milk Tea again with low-stock triggers.", icon: Package },
    { title: "Staff KPIs", desc: "Track attendance and sales performance per member.", icon: Users },
    { title: "Centralized View", desc: "Toggle between North and South branches instantly.", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 font-sans selection:bg-primary/30 flex flex-col">
      {/* Navigation / Header */}
      <header className="fixed top-0 w-full z-50 px-4 lg:px-10 py-3 lg:py-5 flex justify-between items-center transition-all bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group border border-black/5">
            <img 
              src="/src/asset/logo.png" 
              alt="MABI Logo" 
              className="w-full h-full object-cover p-1"
              onError={(e) => {
                e.currentTarget.src = "https://picsum.photos/seed/mabi-logo/200/200"; 
              }}
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="text-xl lg:text-2xl font-black tracking-tighter text-black leading-none block">MABI</span>
            <span className="text-[8px] lg:text-[10px] block font-black text-black/40 uppercase tracking-[0.15em]">Sip & Bites</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 lg:px-4 py-2 bg-[#fefce8] text-yellow-700 rounded-full text-[10px] font-bold border border-yellow-100 shadow-sm">
            <Wifi className="w-3 h-3 text-yellow-500" /> PWA OFFLINE-READY
          </div>
          <button 
            onClick={() => setView('login-owner')}
            className="text-xs lg:text-sm font-black text-black hover:brightness-105 transition-all bg-primary px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl shadow-md"
          >
            <span className="hidden sm:inline">Owner Access</span>
            <span className="sm:hidden">Owner</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-24 lg:pt-32 px-4 lg:px-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div 
              key="landing-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center py-10"
            >
              {/* Hero Section */}
              <div className="space-y-10">
                <div className="flex items-center gap-2 bg-yellow-50 text-black px-4 py-2 rounded-full text-[11px] font-black tracking-tight border border-yellow-200 w-fit">
                  <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                  ISO/IEC 25010 CERTIFIED SYSTEM
                </div>
                
                <h1 className="text-6xl sm:text-8xl md:text-[120px] font-black text-black leading-[0.8] tracking-tighter">
                  Sip. Bite.<br />
                  <span className="relative inline-block mt-2">
                    <span className="absolute left-0 bottom-1 w-full h-[60%] bg-primary z-0"></span>
                    <span className="relative z-10">Monitor.</span>
                  </span>
                </h1>
                
                <p className="text-xl text-gray-500 font-bold max-w-lg leading-relaxed">
                  Centralized oversight for <span className="text-black font-black">Mabi Sip & Bites</span>. Real-time monitoring across North and South branches simplified.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                    onClick={() => setView('login-owner')}
                    className="group px-6 lg:px-10 py-4 lg:py-5 bg-black text-[#ffde3b] rounded-2xl font-black text-lg lg:text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 w-full sm:min-w-[280px]"
                  >
                    Login as Owner 
                    <ArrowRight className="w-5 lg:w-6 h-5 lg:h-6 text-primary stroke-[3px] group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setView('staff-auth')}
                    className="px-6 lg:px-10 py-4 lg:py-5 bg-primary text-black rounded-2xl font-black text-lg lg:text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 w-full sm:min-w-[280px]"
                  >
                    Staff Portal <User className="w-5 lg:w-6 h-5 lg:h-6 stroke-[3px]" />
                  </button>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => setShowLearnMore(!showLearnMore)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors group"
                  >
                    <Info className="w-4 h-4" /> 
                    Learn about our system architecture
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showLearnMore && "rotate-180")} />
                  </button>
                  {showLearnMore && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-5 bg-gray-50 rounded-2xl text-sm text-gray-600 leading-relaxed border border-gray-100 max-w-lg"
                    >
                      Our system addresses manual error reductions and provides real-time control, supporting student-friendly pricing through efficient resource management. Built on a resilient three-tier architecture.
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Feature Grid - Photo Inspired */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Real-time Sales", desc: "Monitor every transaction as it happens at the counter.", icon: ShoppingCart },
                  { title: "Inventory Alerts", desc: "Never run out of Milk Tea again with low-stock triggers.", icon: Package },
                  { title: "Staff KPIs", desc: "Track attendance and sales performance per member.", icon: Users },
                  { title: "Centralized View", desc: "Toggle between North and South branches instantly.", icon: LayoutDashboard },
                ].map((f, i) => (
                  <motion.div 
                    key={f.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/[0.03] group hover:scale-[1.03] transition-all cursor-default flex flex-col items-start gap-4"
                  >
                    <div className="w-12 h-12 bg-yellow-50 text-black rounded-2xl flex items-center justify-center border border-yellow-100 group-hover:bg-primary transition-all">
                      <f.icon className="w-5 h-5 stroke-[2.5px]" />
                    </div>
                    <div>
                      <h4 className="font-black text-black text-lg mb-1">{f.title}</h4>
                      <p className="text-xs text-gray-400 font-bold leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {(view === 'login-owner' || view === 'staff-auth' || view === 'login-staff' || view === 'sign-up') && (
            <motion.div 
              key="login-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#4e4b1a]/90 backdrop-blur-sm"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 222, 59, 0.03) 0%, transparent 70%)'
              }}
            >
              <div className="max-w-md w-full relative">
                <button 
                  onClick={() => {
                    if (view === 'login-staff') setView('staff-auth');
                    else setView('landing');
                  }}
                  className="absolute -top-12 left-0 flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black transition-colors"
                >
                  ← {view === 'login-staff' ? 'Back' : 'Back to home'}
                </button>
                
                <div className="bg-[#2c2a11]/40 backdrop-blur-3xl p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-2xl flex flex-col pt-16 sm:pt-20">
                  {/* Brand Logo - Top Centered */}
                  <div className="absolute -top-10 sm:-top-14 left-1/2 -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 bg-primary rounded-3xl p-3 shadow-2xl border-4 border-[#4e4b1a]">
                    <img 
                      src="/src/asset/logo.png" 
                      alt="MABI Logo" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "https://picsum.photos/seed/mabi-logo/200/200";
                      }}
                    />
                  </div>

                  <div className="text-center mb-8 sm:mb-10">
                    <h3 className="text-2xl sm:text-3xl font-black text-white/90">Welcome back</h3>
                  </div>

                  {view === 'login-owner' ? (
                    <form onSubmit={handleOwnerLogin} className="space-y-6">
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-[10px] sm:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                          <input 
                            type="email" 
                            required
                            placeholder="you@example.com" 
                            className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-white rounded-xl border border-gray-100 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-300 shadow-sm focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] sm:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Password</label>
                          <input 
                            type="password" 
                            required
                            placeholder="........" 
                            className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-white rounded-xl border border-gray-100 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-300 shadow-sm focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 accent-primary"
                          />
                          <span className="text-[10px] sm:text-xs font-bold text-white/40 group-hover:text-white/60 transition-colors">Remember me</span>
                        </label>
                        <button 
                          type="button" 
                          onClick={handleForgotPassword}
                          className="text-[10px] sm:text-xs font-bold text-white/40 hover:text-white/60 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 sm:py-5 bg-primary text-black rounded-xl font-black text-base sm:text-lg hover:brightness-110 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'SIGN IN'}
                      </button>
                      
                      <div className="text-center pt-2">
                        <p className="text-[10px] sm:text-xs font-medium text-white/30">
                          Don't have an account? <button type="button" onClick={() => setView('sign-up')} className="text-white/70 font-bold hover:underline">Sign up</button>
                        </p>
                      </div>
                    </form>
                  ) : view === 'staff-auth' ? (
                    <form onSubmit={handleStaffAuth} className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] sm:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Portal Access Code</label>
                        <input 
                          type="password" 
                          required
                          value={staffPass}
                          onChange={(e) => setStaffPass(e.target.value)}
                          placeholder="........" 
                          className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-white rounded-xl border border-gray-100 outline-none transition-all font-black text-gray-900 text-center tracking-[0.5em] placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-300 shadow-sm"
                        />
                        {authError && (
                          <motion.p 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-[10px] text-red-500 font-bold text-center mt-2"
                          >
                            {authError}
                          </motion.p>
                        )}
                      </div>

                      <button 
                        type="submit"
                        disabled={loading || !staffPass}
                        className="w-full py-4 sm:py-5 bg-primary text-black rounded-xl font-black text-base sm:text-lg hover:brightness-110 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'SIGN IN'}
                      </button>
                    </form>
                  ) : view === 'login-staff' ? (
                    <form onSubmit={handleStaffLogin} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] sm:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Select Branch</label>
                          <div className="grid grid-cols-2 gap-3">
                            {['Branch 1', 'Branch 2'].map((b) => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => setSelectedBranch(b as Branch)}
                                className={cn(
                                  "py-3 rounded-xl border-2 transition-all font-bold text-sm",
                                  selectedBranch === b 
                                    ? "border-primary bg-primary text-black shadow-md" 
                                    : "border-white/5 bg-white/5 text-white/40 hover:border-white/10"
                                )}
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] sm:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Staff Member</label>
                          <div className="relative">
                            <select 
                              required
                              value={selectedStaffId}
                              onChange={(e) => setSelectedStaffId(e.target.value)}
                              className="w-full px-4 py-4 bg-white rounded-xl border border-gray-100 outline-none transition-all font-medium text-gray-900 appearance-none cursor-pointer"
                            >
                              <option value="" disabled>Select your name...</option>
                              {staffList.filter(s => s.branch === selectedBranch).map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={loading || !selectedStaffId}
                        className="w-full py-4 sm:py-5 bg-primary text-black rounded-xl font-black text-base sm:text-lg hover:brightness-110 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'SIGN IN'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSignUp} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] sm:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="John Doe" 
                            className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-white rounded-xl border border-gray-100 outline-none transition-all font-medium text-gray-900 shadow-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] sm:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Branch Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="MABI North" 
                            className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-white rounded-xl border border-gray-100 outline-none transition-all font-medium text-gray-900 shadow-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] sm:text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Password</label>
                          <input 
                            type="password" 
                            required
                            placeholder="........" 
                            className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-white rounded-xl border border-gray-100 outline-none transition-all font-medium text-gray-900 shadow-sm"
                          />
                        </div>
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 sm:py-5 bg-primary text-black rounded-xl font-black text-base sm:text-lg hover:brightness-110 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : 'REGISTER ACCOUNT'}
                      </button>
                      
                      <div className="text-center pt-2">
                        <button type="button" onClick={() => setView('login-owner')} className="text-[10px] sm:text-xs font-bold text-white/40 hover:text-white/60 transition-colors underline underline-offset-4">
                          Already have an account? Sign in
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Help Floating Icon */}
              <div className="fixed bottom-8 right-8">
                <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-lg">?</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 px-8 border-t border-gray-100 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 grayscale opacity-50">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center border border-black/10 overflow-hidden p-1">
              <img 
                src="/src/asset/logo.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/seed/mabi-logo-footer/100/100";
                }}
                referrerPolicy="no-referrer"
              />
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
