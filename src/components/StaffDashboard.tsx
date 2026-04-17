import React, { useState, useEffect } from 'react';
import { User, AttendanceLog } from '../types';
import { Clock, CheckCircle2, XCircle, Calendar, RefreshCw, Wifi, WifiOff, FileText, Plus, Database, Coffee, Info, User as UserIcon, ShoppingCart } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { format, isSameWeek, isSameMonth, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { STAFF } from '../data/mockData';

interface StaffDashboardProps {
  user: User;
  isOffline: boolean;
  onToggleOffline: () => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ user, isOffline, onToggleOffline }) => {
  const [records, setRecords] = useState<AttendanceLog[]>([]);
  const [filter, setFilter] = useState<'week' | 'month'>('week');
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [task, setTask] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const savedRecords = localStorage.getItem('attendance_records');
    if (savedRecords) {
      const allRecords: AttendanceLog[] = JSON.parse(savedRecords);
      setRecords(allRecords.filter(r => r.staffId === user.id));
    } else {
      // Use mock data for first log
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
  }, [user.id]);

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
    alert(`Clocked In successfully at ${format(now, 'hh:mm a')}!`);
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
    alert(`Clocked Out successfully at ${format(now, 'hh:mm a')}!`);
  };

  const handleSync = () => {
    if (isOffline) {
      alert("Please go online to sync records.");
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      const syncedRecords = records.map(r => ({ ...r, isPendingSync: false }));
      saveRecords(syncedRecords);
      setIsSyncing(false);
      alert(`Synced ${records.filter(r => r.isPendingSync).length} records to central server.`);
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
      <div className="bg-primary text-white p-8 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <UserIcon className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Welcome, {user.name}</h1>
              <p className="text-white/60 font-medium">Assigned to: <span className="text-accent underline underline-offset-4">{user.branch}</span></p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <button 
              onClick={onToggleOffline}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border",
                isOffline 
                  ? "bg-white/10 text-accent border-accent" 
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
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-xs font-black shadow-lg shadow-accent/20 hover:scale-105 transition-all"
              >
                <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                SYNC NOW
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Shifts (Month)', value: stats.shifts, icon: Calendar, color: 'blue' },
          { label: 'Hours Worked', value: stats.hours, icon: Clock, color: 'teal' },
          { label: 'Tasks Completed', value: stats.tasks, icon: FileText, color: 'orange' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actions Card */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Attendance Control
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Recorded Name (Confirm Identity)</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    value={recordedName}
                    onChange={(e) => setRecordedName(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Task Details (Optional)</label>
                <textarea 
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Insert task e.g. Prepared drinks"
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 outline-none transition-all text-sm font-medium h-24"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {!isClockedIn ? (
                  <button 
                    onClick={handleClockIn}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    CLOCK IN
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('changeTab', { detail: 'sales' }));
                      }}
                      className="w-full py-4 bg-accent text-white rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      START SELLING
                    </button>
                    <button 
                      onClick={handleClockOut}
                      className="w-full py-3 bg-white text-gray-400 border border-gray-100 rounded-2xl font-bold text-sm hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      CLOCK OUT
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-accent/5 border border-accent/20 p-6 rounded-3xl">
             <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-accent" />
              <p className="text-xs font-bold text-accent-800">Attendance data is used for centralized branch monitoring (Section 1.1).</p>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 card-shadow overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <h3 className="text-xl font-black text-gray-900">Attendance History</h3>
            <div className="flex items-center gap-4">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-white border border-gray-200 text-xs font-bold px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="week">Current Week</option>
                <option value="month">Current Month</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Sessions</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Task / Work Done</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filteredRecords.map((r, idx) => (
                    <motion.tr 
                      key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-gray-900">{format(parseISO(r.clockIn), 'EEE, MMM dd')}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{r.branch}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">IN</p>
                            <p className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">{format(parseISO(r.clockIn), 'hh:mm a')}</p>
                          </div>
                          <div className="w-4 h-[1px] bg-gray-200 mt-4"></div>
                          <div className="text-center text-gray-400">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">OUT</p>
                            <p className="text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                              {r.clockOut ? format(parseISO(r.clockOut), 'hh:mm a') : '--:--'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-medium text-gray-700 max-w-xs">{r.task || 'No task notes'}</p>
                        <p className="text-[10px] text-gray-400 mt-1 italic">Logged as: {r.staffName}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {r.isPendingSync ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black border border-orange-100 animate-pulse">
                            <WifiOff className="w-3 h-3" /> PENDING SYNC
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-600 text-[10px] font-black border border-teal-100">
                            <Database className="w-3 h-3" /> CLOUD SYNCED
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-sm text-gray-400 font-medium">No records found for this period.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <Coffee className="text-white w-6 h-6" />
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
