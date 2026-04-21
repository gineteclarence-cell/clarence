import React, { useState, useEffect } from 'react';
import { User, AttendanceLog, Transaction, InventoryItem, InventoryLog } from '../types';
import { Clock, CheckCircle2, XCircle, Calendar, RefreshCw, Wifi, WifiOff, FileText, Plus, Database, Coffee, Info, User as UserIcon, ShoppingCart, Package, ArrowRight, BarChart3, TrendingUp, History, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { format, isSameWeek, isSameMonth, parseISO, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { STAFF, INVENTORY as INITIAL_INVENTORY, TRANSACTIONS as INITIAL_TRANSACTIONS } from '../data/mockData';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, Legend } from 'recharts';

interface StaffDashboardProps {
  user: User;
  isOffline: boolean;
  onToggleOffline: () => void;
  activeTab: string;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ user, isOffline, onToggleOffline, activeTab }) => {
  const [records, setRecords] = useState<AttendanceLog[]>([]);
  const [filter, setFilter] = useState<'week' | 'month'>('week');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [task, setTask] = useState('');
  
  // Dashboard Data
  const [salesData, setSalesData] = useState<any[]>([]);
  const [inventoryStats, setInventoryStats] = useState<any[]>([]);
  
  // Transaction Records
  const [recordType, setRecordType] = useState<'Sales' | 'Inventory'>('Sales');
  const [salesLogs, setSalesLogs] = useState<Transaction[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);

  useEffect(() => {
    // Attendance
    const savedRecords = localStorage.getItem('attendance_records');
    if (savedRecords) {
      const allRecords: AttendanceLog[] = JSON.parse(savedRecords);
      setRecords(allRecords.filter(r => r.staffId === user.id));
    } else {
      const staffMock = STAFF.find(s => s.id === user.id);
      if (staffMock) {
        setRecords(staffMock.attendanceLogs);
        localStorage.setItem('attendance_records', JSON.stringify(staffMock.attendanceLogs));
      }
    }

    const currentStatus = localStorage.getItem(`status_${user.id}`);
    if (currentStatus === 'clocked_in') {
      setIsClockedIn(true);
    }

    // Sales Data (Daily Trends)
    const savedSales = localStorage.getItem('global_transactions');
    const transactions: Transaction[] = savedSales ? JSON.parse(savedSales) : INITIAL_TRANSACTIONS;
    setSalesLogs(transactions.filter(t => t.branch === user.branch).slice(0, 50));
    
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    const trends = days.map(day => {
      const dayStr = format(day, 'MMM dd');
      const dayTotal = transactions
        .filter(t => format(new Date(t.time), 'MMM dd') === dayStr && (t.branch === user.branch))
        .reduce((acc, t) => acc + t.amount, 0);
      return { name: dayStr, sales: dayTotal };
    });
    setSalesData(trends);

    // Inventory Data
    const invKey = `mabi_inventory_${user.branch}`;
    const savedInv = localStorage.getItem(invKey);
    const inventory: InventoryItem[] = savedInv ? JSON.parse(savedInv) : INITIAL_INVENTORY;
    setInventoryStats(inventory.map(i => ({
      name: i.name,
      stock: i.stock,
      min: i.minStock,
      status: i.stock <= i.minStock ? 'Low' : 'OK'
    })));

    // Inventory Logs
    const logsKey = `mabi_inventory_logs_${user.branch}`;
    const savedInvLogs = localStorage.getItem(logsKey);
    if (savedInvLogs) {
      const allInvLogs: InventoryLog[] = JSON.parse(savedInvLogs);
      setInventoryLogs(allInvLogs.filter(l => l.branch === user.branch));
    }

  }, [user.id, user.branch]);

  const saveRecords = (newRecordsForUser: AttendanceLog[]) => {
    setRecords(newRecordsForUser);
    const savedRecords = localStorage.getItem('attendance_records');
    let allRecords: AttendanceLog[] = savedRecords ? JSON.parse(savedRecords) : [];
    
    // Merge: Remove old records for this user and add new ones
    allRecords = allRecords.filter(r => r.staffId !== user.id);
    allRecords = [...newRecordsForUser, ...allRecords];
    
    localStorage.setItem('attendance_records', JSON.stringify(allRecords));
  };

  const [recordedName, setRecordedName] = useState(user.name);

  const handleClockIn = () => {
    const now = new Date();
    const newRecord: AttendanceLog = {
      id: `att-${Date.now()}`,
      staffId: user.id,
      staffName: recordedName,
      branch: user.branch,
      date: format(now, 'yyyy-MM-dd'),
      clockIn: now.toISOString(),
      task: task || 'Working shift',
      isPendingSync: isOffline,
    };

    saveRecords([newRecord, ...records]);
    setIsClockedIn(true);
    localStorage.setItem(`status_${user.id}`, 'clocked_in');
    setTask('');
  };

  const handleClockOut = () => {
    const now = new Date();
    const updatedRecords = [...records];
    if (updatedRecords.length > 0 && !updatedRecords[0].clockOut) {
      updatedRecords[0].clockOut = now.toISOString();
      if (isOffline) updatedRecords[0].isPendingSync = true;
      saveRecords(updatedRecords);
    }
    setIsClockedIn(false);
    localStorage.removeItem(`status_${user.id}`);
  };

  const handleSync = () => {
    if (isOffline) {
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      const syncedRecords = records.map(r => ({ ...r, isPendingSync: false }));
      saveRecords(syncedRecords);
      setIsSyncing(false);
    }, 1500);
  };

  const filteredRecords = records.filter(r => {
    const d = parseISO(r.clockIn);
    if (filter === 'week') return isSameWeek(d, new Date());
    if (filter === 'month') return isSameMonth(d, new Date());
    return true;
  });

  const stats = {
    shifts: records.filter(r => isSameMonth(parseISO(r.clockIn), new Date())).length,
    hours: records.reduce((acc, r) => {
      if (r.clockOut) {
        const diff = (new Date(r.clockOut).getTime() - new Date(r.clockIn).getTime()) / (1000 * 60 * 60);
        return acc + diff;
      }
      return acc;
    }, 0).toFixed(1),
    tasks: records.filter(r => r.task && r.task !== 'Working shift').length,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Profile */}
      <div className="bg-primary text-black p-8 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden border-2 border-black/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center border border-black/10 shadow-xl overflow-hidden p-2">
              <img 
                src="/src/asset/logo.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/seed/mabi-logo-staff/200/200";
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter">Hello, {user.name}</h1>
              <p className="text-black/60 font-black uppercase tracking-[0.2em] text-[10px] mt-1">
                Active at: <span className="text-black">{user.branch}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <button 
              onClick={onToggleOffline}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all border-2",
                isOffline 
                  ? "bg-white/10 text-accent border-accent/50" 
                  : "bg-white/10 text-teal-400 border-teal-500/50"
              )}
            >
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              {isOffline ? 'OFFLINE MODE' : 'STREET SYNC: ON'}
            </button>
            
            {records.some(r => r.isPendingSync) && (
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-xs font-black shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
              >
                <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                SYNC NOW
              </button>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {[
          { label: 'Total Shifts', value: stats.shifts, icon: Calendar, color: 'blue' },
          { label: 'Hours', value: stats.hours, icon: Clock, color: 'teal' },
          { label: 'Tasks', value: stats.tasks, icon: FileText, color: 'orange' },
        ].map((stat, i) => (
          <div 
            key={i}
            className={cn(
              "bg-white p-4 md:p-6 rounded-3xl border border-gray-100 card-shadow group hover:border-primary/20 transition-all",
              i === 2 && "col-span-2 md:col-span-1"
            )}
          >
            <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
              <div className="p-2 md:p-3 bg-gray-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

          {/* Charts Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Chart */}
            <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-gray-100 card-shadow h-[300px] md:h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  Sales Trend
                </h3>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0a2e36" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0a2e36" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(val) => `₱${val}`} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '800', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="sales" stroke="#000" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inventory Chart */}
            <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-gray-100 card-shadow h-[300px] md:h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                  Stock Levels
                </h3>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryStats} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} width={80} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '800', fontSize: '12px' }} />
                    <Bar dataKey="stock" radius={[0, 10, 10, 0]} barSize={20}>
                      {inventoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.status === 'Low' ? '#ea580c' : '#0a2e36'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Transaction Records Section */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 card-shadow overflow-hidden">
            <div className="p-5 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-gray-50/30">
              <div>
                <h3 className="text-lg md:text-2xl font-black text-gray-900 flex items-center gap-2 md:gap-3">
                  <History className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                  Transactions
                </h3>
                <p className="text-[10px] md:text-sm text-gray-400 font-medium mt-1 uppercase tracking-tight">Audit log for {user.branch}</p>
              </div>
              
              <div className="flex bg-white p-1 rounded-xl border border-gray-100">
                {['Sales', 'Inventory'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setRecordType(type as any)}
                    className={cn(
                      "flex-1 md:flex-none px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      recordType === type 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-gray-400 hover:text-primary"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time & Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{recordType === 'Sales' ? 'Reference' : 'Item Info'}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{recordType === 'Sales' ? 'Total Amount' : 'Change'}</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence mode="wait">
                    {recordType === 'Sales' ? (
                      salesLogs.map((log) => (
                        <motion.tr 
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-8 py-6">
                            <p className="text-sm font-black text-gray-900">{format(parseISO(log.time), 'MMM dd')}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{format(parseISO(log.time), 'hh:mm a')}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                <Tag className="w-5 h-5" />
                              </div>
                              <p className="text-sm font-black text-gray-900">{log.id}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-lg font-black text-primary">₱{log.amount.toLocaleString()}</td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                <UserIcon className="w-4 h-4" />
                              </div>
                              <p className="text-sm font-bold text-gray-700">{log.staffName}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black border border-green-100 uppercase">
                              Success
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      inventoryLogs.map((log) => {
                        const diff = log.newStock - log.previousStock;
                        return (
                          <motion.tr 
                            key={log.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-8 py-6">
                              <p className="text-sm font-black text-gray-900">{format(parseISO(log.time), 'MMM dd')}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">{format(parseISO(log.time), 'hh:mm a')}</p>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-accent/5 rounded-xl flex items-center justify-center text-accent">
                                  <Package className="w-5 h-5" />
                                </div>
                                <p className="text-sm font-black text-gray-900">{log.itemName}</p>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <p className="text-lg font-black text-gray-900">{log.newStock}</p>
                                <span className={cn(
                                  "text-[10px] font-black px-2 py-0.5 rounded-lg",
                                  diff > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                )}>
                                  {diff > 0 ? '+' : ''}{diff}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                  <UserIcon className="w-4 h-4" />
                                </div>
                                <p className="text-sm font-bold text-gray-700">{log.staffName}</p>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-600 text-[10px] font-black border border-teal-100 uppercase">
                                Logged
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Attendance Controls */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col items-center text-center">
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500",
                isClockedIn ? "bg-red-50 text-red-500 animate-pulse" : "bg-primary/5 text-primary"
              )}>
                <Clock className="w-12 h-12" />
              </div>
              
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                {isClockedIn ? 'Working Shift' : 'Not Clocked In'}
              </h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">
                {format(new Date(), 'EEEE, MMMM do')}
              </p>

              <div className="w-full space-y-4">
                {!isClockedIn ? (
                  <>
                    <input 
                      type="text" 
                      placeholder="What are you working on today?"
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition-all font-bold text-sm"
                    />
                    <button 
                      onClick={handleClockIn}
                      className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
                    >
                      <Plus className="w-6 h-6" /> CLOCK IN
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleClockOut}
                    className="w-full py-5 bg-red-500 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
                  >
                    <XCircle className="w-6 h-6" /> CLOCK OUT
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-accent/5 p-6 rounded-3xl border border-accent/10 flex items-start gap-4">
              <div className="p-2 bg-accent rounded-lg text-white mt-1">
                <Info className="w-4 h-4" />
              </div>
              <p className="text-xs text-accent font-bold leading-relaxed italic">
                Attendance logs are used for payroll calculation. Please ensure you clock in and out accurately for your assigned branch.
              </p>
            </div>
          </div>

          {/* Attendance History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 card-shadow overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    Attendance History
                  </h3>
                  <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-tight">Your recent work logs at {user.branch}</p>
                </div>
                
                <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                  {['week', 'month'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      className={cn(
                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        filter === f ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-primary"
                      )}
                    >
                      THIS {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Clock In</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Clock Out</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRecords.map((record) => {
                      const duration = record.clockOut 
                        ? ((new Date(record.clockOut).getTime() - new Date(record.clockIn).getTime()) / (1000 * 60 * 60)).toFixed(1)
                        : '--';
                      
                      return (
                        <tr key={record.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-8 py-6">
                            <p className="text-sm font-black text-gray-900">{format(parseISO(record.clockIn), 'MMM dd, yyyy')}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{record.task}</p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-gray-700">{format(parseISO(record.clockIn), 'hh:mm a')}</p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-gray-700">
                              {record.clockOut ? format(parseISO(record.clockOut), 'hh:mm a') : '--:--'}
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-black text-primary">{duration}h</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {record.isPendingSync ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black border border-amber-100">
                                <RefreshCw className="w-3 h-3 animate-spin" /> PENDING
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black border border-teal-100">
                                <CheckCircle2 className="w-3 h-3" /> SYNCED
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRecords.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-gray-400">
                          <p className="text-sm font-bold uppercase tracking-widest italic opacity-50">No attendance logs for this period.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <footer className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center border border-black/10">
            <div className="font-black text-black text-[10px] flex flex-col items-center">
              <span className="mb-[-2px]">M</span>
              <span>B</span>
            </div>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">MABI SYSTEM STAFF v1.4.2</p>
        </div>
        <p className="text-[10px] md:text-xs text-gray-400 max-w-md text-center md:text-right font-medium leading-relaxed">
          Compliant with <span className="text-gray-600 font-bold">ISO/IEC 25010:2023 (Reliability, Usability)</span> and 
          <span className="text-gray-600 font-bold ml-1">Data Privacy Act of 2012</span>. 
          Session encryption enabled.
        </p>
      </footer>
    </div>
  );
};

export default StaffDashboard;
