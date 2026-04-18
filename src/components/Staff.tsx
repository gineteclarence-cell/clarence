import React, { useState, useEffect } from 'react';
import { Branch, StaffMember } from '../types';
import { STAFF as INITIAL_STAFF } from '../data/mockData';
import { Users, Clock, TrendingUp, CheckCircle2, XCircle, Plus, Trash2, UserPlus, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const Staff: React.FC<{ branch: Branch }> = ({ branch }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBranch, setNewBranch] = useState<Exclude<Branch, 'All'>>('Branch 1');

  useEffect(() => {
    const loadStaff = () => {
      const savedStaff = localStorage.getItem('mabi_system_staff');
      if (savedStaff) {
        const parsed = JSON.parse(savedStaff);
        // Migration: Ensure all codes are numeric if they aren't
        const needsMigration = parsed.some((s: any) => isNaN(Number(s.accessCode)));
        if (needsMigration) {
          const migrated = parsed.map((s: any) => ({
            ...s,
            accessCode: isNaN(Number(s.accessCode)) ? Math.floor(100000 + Math.random() * 900000).toString() : s.accessCode
          }));
          saveStaff(migrated);
        } else {
          setStaffList(parsed);
        }
      } else {
        setStaffList(INITIAL_STAFF);
        localStorage.setItem('mabi_system_staff', JSON.stringify(INITIAL_STAFF));
      }
    };
    loadStaff();
    window.addEventListener('storage', loadStaff);
    return () => window.removeEventListener('storage', loadStaff);
  }, []);

  const saveStaff = (newList: StaffMember[]) => {
    setStaffList([...newList]); // Ensure new reference
    localStorage.setItem('mabi_system_staff', JSON.stringify(newList));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    // Generate numeric code (6 digits)
    const numericCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newStaff: StaffMember = {
      id: `st-${Date.now()}`,
      name: newName,
      branch: newBranch,
      accessCode: numericCode,
      active: false,
      transactionsProcessed: 0,
      attendanceLogs: []
    };

    const updated = [newStaff, ...staffList];
    saveStaff(updated);
    setNewName('');
    setIsAdding(false);
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm("Are you sure you want to remove this staff member? All their data will be deleted.")) {
      const updated = staffList.filter(s => s.id !== id);
      saveStaff(updated);
    }
  };

  const filteredStaff = staffList.filter(s => branch === 'All' || s.branch === branch);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Active Staff</span>
          </div>
          <h3 className="text-2xl font-bold">{filteredStaff.filter(s => s.active).length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Avg. Shift Duration</span>
          </div>
          <h3 className="text-2xl font-bold">8.5 Hours</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Transactions</span>
          </div>
          <h3 className="text-2xl font-bold">{filteredStaff.reduce((acc, s) => acc + s.transactionsProcessed, 0)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">Attendance & Performance</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Managing {filteredStaff.length} staff members</p>
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> ADD STAFF
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Staff Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Branch</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Access Code</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {filteredStaff.map((staff, idx) => (
                      <motion.tr 
                        key={staff.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                              {staff.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{staff.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {staff.active ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-teal-600">
                              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                              ON SHIFT
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                              OFF DUTY
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{staff.branch}</td>
                        <td className="px-6 py-4">
                          <code className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-lg text-primary tracking-[0.2em] border border-gray-200">
                            {staff.accessCode}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove Staff"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredStaff.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 italic text-sm">
                        No staff members found for this branch.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-6 rounded-2xl border-2 border-primary/20 shadow-xl"
              >
                <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
                  <UserPlus className="w-6 h-6 text-primary" />
                  Register New Staff
                </h3>
                <form onSubmit={handleAddStaff} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      autoFocus
                      required
                      placeholder="e.g. Juan De La Cruz"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary/20 outline-none font-bold text-sm transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assign Branch</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Branch 1', 'Branch 2'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setNewBranch(b as any)}
                          className={cn(
                            "py-2.5 rounded-xl border-2 transition-all font-bold text-[10px] uppercase",
                            newBranch === b 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100"
                          )}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all uppercase"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-2 py-3 bg-primary text-white rounded-xl font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20 transition-all uppercase"
                    >
                      Confirm Addition
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Portal Insight
            </h3>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                <Info className="w-3 h-3" /> Security Note
              </p>
              <p className="text-xs text-amber-700/70 font-medium leading-relaxed italic">
                Portal access codes are now strictly <span className="font-bold">6-digit numeric sequences</span>. Upon adding a new member, their code is automatically generated.
              </p>
            </div>
            
            <div className="space-y-6">
              {filteredStaff.slice(0, 5).map((staff, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== Math.min(filteredStaff.length, 5) - 1 && <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-50"></div>}
                  <div className={cn(
                    "w-6 h-6 rounded-full flex-shrink-0 z-10 flex items-center justify-center border-2 border-white",
                    staff.active ? "bg-teal-500" : "bg-gray-300"
                  )}></div>
                  <div className="space-y-1 pb-4">
                    <p className="text-sm font-bold text-gray-900">
                      {staff.name} {staff.active ? 'is Active' : 'is Inactive'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Code: <span className="font-mono">{staff.accessCode}</span> • {staff.branch}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staff;
