import React, { useState } from 'react';
import { Branch } from '../types';
import { TRANSACTIONS } from '../data/mockData';
import { Search, Download, Filter, FileText, Send } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SalesProps {
  branch: Branch;
}

const Sales: React.FC<SalesProps> = ({ branch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTransactions = TRANSACTIONS.filter(t => 
    (branch === 'All' || t.branch === branch) &&
    (t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.staffName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const simulateReport = (type: string) => {
    alert(`Generating ${type} Sales Report for ${branch}... PDF format. (SIMULATED)`);
  };

  const simulateNotification = () => {
    alert("Daily summary sent to owner@mabi.com (SIMULATED)");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search transaction ID or staff name..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => simulateReport('Monthly')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Monthly PDF
          </button>
          <button 
            onClick={simulateNotification}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
          >
            <Send className="w-4 h-4" />
            Send Summary
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((tx, idx) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-sm text-primary font-bold">{tx.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{tx.staffName}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                      tx.branch === 'Branch 1' ? "bg-teal-50 text-teal-700" : "bg-purple-50 text-purple-700"
                    )}>
                      {tx.branch}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(tx.amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(tx.time)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-primary hover:underline font-medium">Details</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No transactions found matching your search.
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-center gap-2 mt-4">
        <button onClick={() => simulateReport('Daily')} className="text-xs text-gray-500 hover:text-primary underline">Download Daily Sheet</button>
        <span className="text-gray-300">|</span>
        <button onClick={() => simulateReport('Weekly')} className="text-xs text-gray-500 hover:text-primary underline">Download Weekly Log</button>
      </div>
    </div>
  );
};

export default Sales;
