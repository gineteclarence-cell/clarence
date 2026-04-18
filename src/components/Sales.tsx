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
    // Logic for generating Sales Report would go here
  };

  const simulateNotification = () => {
    // Logic for sending summary would go here
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
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-black text-primary rounded-xl text-sm font-black hover:brightness-110 transition-all shadow-sm"
          >
            <Send className="w-4 h-4 text-primary" />
            Send Summary
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-black text-gray-900 tracking-tight text-xl">Sales Tracking Record</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Consolidated transaction history across branches</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Branch</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((tx, idx) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-primary/5 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-black font-black">{tx.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{tx.staffName}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                      tx.branch === 'Branch 1' ? "bg-black text-primary border-black" : "bg-primary text-black border-black/10"
                    )}>
                      {tx.branch}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-gray-900">{formatCurrency(tx.amount)}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">{formatDate(tx.time)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-black hover:text-primary transition-colors font-black text-xs underline underline-offset-4 decoration-primary decoration-2">View Receipt</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-gray-500 italic text-sm">
              No sales records found matching your filters.
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
