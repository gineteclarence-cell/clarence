import React, { useState } from 'react';
import { Branch } from '../types';
import { TRANSACTIONS } from '../data/mockData';
import { Search, Download, Filter, FileText, Send, X, Receipt, ShoppingBag, User as UserIcon, Calendar, MapPin, Printer } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';

interface SalesProps {
  branch: Branch;
}

const Sales: React.FC<SalesProps> = ({ branch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  const filteredTransactions = TRANSACTIONS.filter(t => 
    (branch === 'All' || t.branch === branch) &&
    (t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.staffName.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    if (branch === 'All') {
      if (a.branch !== b.branch) return a.branch.localeCompare(b.branch);
    }
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  const simulateReport = (type: string) => {
    // Logic for generating Sales Report would go here
  };

  const simulateNotification = () => {
    // Logic for sending summary would go here
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              {/* Receipt Header */}
              <div className="bg-primary p-8 text-black relative">
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="absolute top-6 right-6 p-2 bg-black/10 rounded-full hover:bg-black/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-lg p-3">
                     <img 
                      src="/src/asset/logo.png" 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "https://picsum.photos/seed/mabi-logo/200/200";
                      }}
                    />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase mb-1">MABI SIP & BITES</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Official Receipt</p>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</p>
                    <p className="text-sm font-black text-gray-900">{selectedTx.id}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</p>
                    <p className="text-xs font-bold text-gray-700">{formatDate(selectedTx.time)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Branch Location</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                      <MapPin className="w-3 h-3 text-primary" />
                      {selectedTx.branch}
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Served By</p>
                    <div className="flex items-center justify-end gap-1 text-xs font-bold text-gray-700">
                      <UserIcon className="w-3 h-3 text-primary" />
                      {selectedTx.staffName}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Order Summary</p>
                  </div>
                  <div className="space-y-3">
                    {selectedTx.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-600">{item}</span>
                        <span className="font-black text-gray-900">₱85.00</span>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-dashed border-gray-200 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-400">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedTx.amount * 0.88)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-gray-400">
                        <span>Tax (12%)</span>
                        <span>{formatCurrency(selectedTx.amount * 0.12)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-black text-gray-900 pt-2">
                        <span>TOTAL</span>
                        <span className="text-primary bg-black px-3 py-1 rounded-xl">{formatCurrency(selectedTx.amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 text-center space-y-4">
                  <div className="py-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 italic">"Thank you for choosing MABI! Follow us @mabisipandbites"</p>
                  </div>
                  <button 
                    onClick={() => {
                      alert("Connecting to Cloud Printer...");
                      setSelectedTx(null);
                    }}
                    className="w-full py-4 bg-black text-primary rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-black/10"
                  >
                    <Printer className="w-4 h-4" /> PRINT RECEPT
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            <h3 className="font-black text-gray-900 tracking-tight text-xl">
              {branch === 'All' ? 'Sales Tracking Record' : `${branch} Sales Record`}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {branch === 'All' 
                ? 'Consolidated transaction history across all active branches' 
                : `Viewing exclusive transaction history for ${branch}`}
            </p>
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
              {filteredTransactions.map((tx, idx) => {
                const showBranchHeader = branch === 'All' && 
                  (idx === 0 || filteredTransactions[idx - 1].branch !== tx.branch);
                
                return (
                  <React.Fragment key={tx.id}>
                    {showBranchHeader && (
                      <tr className="bg-gray-50/80">
                        <td colSpan={6} className="px-6 py-2">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              tx.branch === 'Branch 1' ? "bg-black" : "bg-primary"
                            )} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                              Data from {tx.branch}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.01 }}
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
                        <button 
                          onClick={() => setSelectedTx(tx)}
                          className="text-black hover:text-primary transition-colors font-black text-xs underline underline-offset-4 decoration-primary decoration-4"
                        >
                          View Receipt
                        </button>
                      </td>
                    </motion.tr>
                  </React.Fragment>
                );
              })}
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
