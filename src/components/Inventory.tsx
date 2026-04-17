import React, { useState } from 'react';
import { INVENTORY } from '../data/mockData';
import { Package, AlertCircle, RefreshCw, Scan, Plus, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const Inventory: React.FC<{ isOffline: boolean }> = ({ isOffline }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState(INVENTORY);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const lowStockItems = items.filter(item => item.stock <= item.minStock);

  const handleBarcodeScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const barcode = (e.currentTarget.elements.namedItem('barcode') as HTMLInputElement).value;
    alert(`Barcode ${barcode} scanned. Searching inventory...`);
    setSearchTerm(barcode); // Simulating search
    e.currentTarget.reset();
  };

  const handleSync = () => {
    if (isOffline) {
      alert("Offline mode activated. Data cached locally. Will sync when online.");
      return;
    }
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      alert("Inventory synced with central server.");
    }, 1500);
  };

  const handleSubmitData = () => {
    if (isOffline) {
      alert("Offline mode activated. Data cached locally. Will sync when online.");
    } else {
      alert("Inventory data submitted successfully to central branch!");
    }
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
            className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="text-orange-600 w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-orange-800">Low Stock Alert!</p>
                <p className="text-xs text-orange-700">
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
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all">
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Level</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400">
                          <span>{item.stock} / {item.minStock * 2}</span>
                          <span>{Math.round((item.stock / (item.minStock * 2)) * 100)}%</span>
                        </div>
                        <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              item.stock <= item.minStock ? "bg-orange-500" : "bg-teal-500"
                            )}
                            style={{ width: `${Math.min(100, (item.stock / (item.minStock * 2)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.stock <= item.minStock ? (
                        <span className="flex items-center gap-1 text-orange-600 font-bold text-xs">
                          <AlertCircle className="w-3 h-3" /> LOW STOCK
                        </span>
                      ) : (
                        <span className="text-teal-600 font-bold text-xs uppercase tracking-wider">Optimal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:underline text-sm font-bold">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-primary text-white p-6 rounded-2xl shadow-xl shadow-primary/20">
            <h4 className="font-bold flex items-center gap-2 mb-4">
              <Scan className="w-5 h-5" />
              Barcode Scanner
            </h4>
            <p className="text-sm text-white/70 mb-4">Simulate a barcode scan to quickly find items in the systems.</p>
            <form onSubmit={handleBarcodeScan} className="space-y-3">
              <input 
                name="barcode"
                type="text" 
                placeholder="Enter barcode..." 
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl outline-none focus:bg-white/20 transition-all font-mono"
              />
              <button 
                onClick={handleSubmitData}
                className="w-full py-2 bg-accent text-white rounded-xl font-bold text-sm hover:brightness-110 transition-all"
              >
                Process Scan
              </button>
            </form>
            
            <button 
              onClick={handleSubmitData}
              className="w-full mt-4 py-3 bg-white text-primary border-2 border-primary rounded-xl font-bold text-sm hover:bg-primary/5 transition-all"
            >
              Submit Inventory Data
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
            <h4 className="font-bold text-gray-900 mb-4">Inventory Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Total SKU</span>
                <span className="text-sm font-bold">{items.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Out of Stock</span>
                <span className="text-sm font-bold text-red-500">0</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Stock Value</span>
                <span className="text-sm font-bold text-teal-600">₱45,200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
