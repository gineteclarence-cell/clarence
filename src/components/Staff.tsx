import React from 'react';
import { Branch } from '../types';
import { STAFF } from '../data/mockData';
import { Users, Clock, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const Staff: React.FC<{ branch: Branch }> = ({ branch }) => {
  const filteredStaff = STAFF.filter(s => branch === 'All' || s.branch === branch);

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
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Attendance & Performance</h3>
            <button className="text-xs font-bold text-primary hover:underline">Export Logs</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Staff Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Branch</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Transactions</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Today's Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.map((staff, idx) => (
                  <motion.tr 
                    key={staff.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{staff.transactionsProcessed}</span>
                        <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${(staff.transactionsProcessed / 200) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-mono text-gray-500">
                      {staff.active ? '08:00 AM - --:--' : '08:00 AM - 05:00 PM'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-6">
            {filteredStaff.map((staff, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== filteredStaff.length - 1 && <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gray-50"></div>}
                <div className={cn(
                  "w-6 h-6 rounded-full flex-shrink-0 z-10 flex items-center justify-center border-2 border-white",
                  staff.active ? "bg-teal-500" : "bg-gray-300"
                )}></div>
                <div className="space-y-1 pb-4">
                  <p className="text-sm font-bold text-gray-900">
                    {staff.name} {staff.active ? 'Clocked In' : 'Clocked Out'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {staff.active ? '8:05 AM today' : '5:00 PM yesterday'} • {staff.branch}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staff;
