import React, { useState } from 'react';
import { Branch } from '../types';
import { INVENTORY } from '../data/mockData';
import { Package, AlertCircle, RefreshCw, Scan, Plus, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const Inventory: React.FC<{ isOffline: boolean; branch: Branch }> = ({ isOffline, branch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter items by branch if needed (though INVENTORY in mock data is global, 
  // in a real app it would be branch-specific. For now, let's assume all items 
  // apply but we filter the transaction records)
  const items = INVENTORY;
  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const lowStockItems = filteredItems.filter(item => item.stock <= item.minStock);

  const mockTransactions = [
    { date: '2026-04-18 14:20', item: 'Milk Tea Base', branch: 'Branch 1', change: '-5.0L', staff: 'Alice Santos', status: 'Consumed' },
    { date: '2026-04-18 13:45', item: 'Potato Fries', branch: 'Branch 1', change: '+20.0kg', staff: 'Owner', status: 'Restocked' },
    { date: '2026-04-18 12:10', item: 'Tapioca Pearls', branch: 'Branch 2', change: '-2.0kg', staff: 'Charlie Cruz', status: 'Consumed' },
    { date: '2026-04-17 17:30', item: 'Siomai Packs', branch: 'Branch 1', change: '+10 Packs', staff: 'Owner', status: 'Restocked' },
  ];

  const filteredTransactions = mockTransactions.filter(t => branch === 'All' || t.branch === branch);

  const handleBarcodeScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const barcode = (e.currentTarget.elements.namedItem('barcode') as HTMLInputElement).value;
    setSearchTerm(barcode); // Simulating search
    e.currentTarget.reset();
  };

  const handleSync = () => {
    if (isOffline) {
      return;
    }
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleSubmitData = () => {
    // Inventory data submission logic would go here
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <AnimatePresence>
        {lowStockItems.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black border-l-4 border-primary p-4 rounded-r-xl"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="text-primary w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-black text-primary">Low Stock Alert!</p>
                <p className="text-xs text-white/70 font-medium">
                  {lowStockItems.length} items are below minimum stock levels: {lowStockItems.map(i => i.name).join(', ')}.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search items..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleSync}
                className={cn(
                  "p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all",
                  isRefreshing && "animate-spin"
                )}
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-black text-primary rounded-xl text-sm font-black hover:brightness-110 transition-all shadow-sm">
                <Plus className="w-4 h-4 text-primary" />
                Add Item
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-black text-gray-900 tracking-tight text-xl">Inventory Monitoring</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live stock levels & reorder alerts</p>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Level</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-sm font-black text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-500">{item.category}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black text-gray-400">
                          <span>{item.stock} / {item.minStock * 2}</span>
                          <span>{Math.round((item.stock / (item.minStock * 2)) * 100)}%</span>
                        </div>
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              item.stock <= item.minStock ? "bg-red-600" : "bg-black"
                            )}
                            style={{ width: `${Math.min(100, (item.stock / (item.minStock * 2)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.stock <= item.minStock ? (
                        <span className="flex items-center gap-1.5 text-red-600 font-black text-[10px] uppercase border border-red-100 bg-red-50 px-2 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" /> LOW STOCK
                        </span>
                      ) : (
                        <span className="text-black bg-primary px-2 py-1 rounded-full border border-black/5 font-black text-[10px] uppercase tracking-wider">Optimal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-black hover:text-primary transition-colors text-xs font-black underline underline-offset-4 decoration-primary decoration-2">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-white">
              <h3 className="font-black text-gray-900 tracking-tight text-xl">Stock Transaction Record</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Recent logs of additions and deductions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4">Change</th>
                    <th className="px-6 py-4">Staff</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map((log, i) => (
                    <tr key={i} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-400">{log.date}</td>
                      <td className="px-6 py-4 font-black text-gray-900">{log.item}</td>
                      <td className="px-6 py-4 font-bold text-gray-600 uppercase tracking-tighter">{log.branch}</td>
                      <td className={cn(
                        "px-6 py-4 font-black",
                        log.change.startsWith('+') ? "text-teal-600" : "text-red-600"
                      )}>
                        {log.change}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-600">{log.staff}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                          log.status === 'Restocked' ? "bg-black text-primary border-black" : "bg-primary text-black border-black/10"
                        )}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-primary text-black p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 border-2 border-black/5">
            <h4 className="font-black flex items-center gap-2 mb-4 text-xl tracking-tight">
              <Scan className="w-6 h-6" />
              Scanner
            </h4>
            <p className="text-sm text-black/60 font-medium mb-6 leading-relaxed">Simulate a barcode scan to quickly find items in the systems.</p>
            <form onSubmit={handleBarcodeScan} className="space-y-4">
              <input 
                name="barcode"
                type="text" 
                placeholder="Enter barcode..." 
                className="w-full px-4 py-4 bg-white border border-black/10 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 transition-all font-mono font-black"
              />
              <button 
                type="submit"
                className="w-full py-4 bg-black text-primary rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20"
              >
                Scan Item
              </button>
            </form>
            
            <button 
              onClick={handleSubmitData}
              className="w-full mt-8 py-4 bg-transparent text-black border-2 border-black rounded-2xl font-black text-sm hover:bg-black hover:text-primary transition-all uppercase tracking-widest"
            >
              Submit Session
            </button>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
            <h4 className="font-black text-gray-900 mb-6 text-xl tracking-tight">Cloud Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-sm font-bold text-gray-500">Total SKU</span>
                <span className="text-lg font-black">{items.length}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-sm font-bold text-gray-500">Critical Alerts</span>
                <span className="text-lg font-black text-red-600">{lowStockItems.length}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm font-bold text-gray-500">Inventory Value</span>
                <span className="text-lg font-black text-black">₱45,200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
