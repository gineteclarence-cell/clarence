import React, { useState, useEffect } from 'react';
import { InventoryItem, User, InventoryLog } from '../types';
import { Package, AlertCircle, CheckCircle2, RefreshCw, Search, Plus, Minus, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { INVENTORY as INITIAL_INVENTORY } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface StaffInventoryProps {
  user: User;
}

const StaffInventory: React.FC<StaffInventoryProps> = ({ user }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Low Stock' | 'In Stock'>('All');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mabi_inventory');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems(INITIAL_INVENTORY);
      localStorage.setItem('mabi_inventory', JSON.stringify(INITIAL_INVENTORY));
    }
  }, []);

  const saveItems = (newItems: InventoryItem[]) => {
    setItems(newItems);
    localStorage.setItem('mabi_inventory', JSON.stringify(newItems));
  };

  const updateStock = (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const prevStock = item.stock;
    const newStock = Math.max(0, prevStock + delta);

    if (prevStock === newStock) return;

    const newItems = items.map(i => {
      if (i.id === id) {
        return { ...i, stock: newStock };
      }
      return i;
    });
    saveItems(newItems);

    // Record Log
    const log: InventoryLog = {
      id: `inv-log-${Date.now()}`,
      itemId: id,
      itemName: item.name,
      previousStock: prevStock,
      newStock: newStock,
      staffName: user.name,
      time: new Date().toISOString(),
      branch: user.branch
    };

    const savedLogs = localStorage.getItem('mabi_inventory_logs');
    const logs: InventoryLog[] = savedLogs ? JSON.parse(savedLogs) : [];
    localStorage.setItem('mabi_inventory_logs', JSON.stringify([log, ...logs].slice(0, 100)));
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const isLow = item.stock <= item.minStock;
    if (filter === 'Low Stock' && !isLow) return false;
    if (filter === 'In Stock' && isLow) return false;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* Store Operations Quick Links */}
      <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-1">Store Operations</h3>
            <p className="text-sm text-gray-500 font-medium">Quickly manage branch inventory and menu items.</p>
          </div>
          <div className="h-[1px] md:h-12 bg-primary/10 md:w-[1px]"></div>
          <div className="flex items-center gap-4 text-xs font-black text-primary/60 uppercase tracking-widest">
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            Live Sync: ACTIVE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-primary/20 card-shadow transition-all text-left">
            <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity">
              <Package className="w-32 h-32 text-primary transform rotate-12" />
            </div>
            <div className="relative z-10 text-primary">
              <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6">
                <Package className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">Inventory Management</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[200px]">Check stock levels, update supplies, and receive low-stock alerts.</p>
              <div className="mt-6 flex items-center gap-2 font-black text-xs uppercase tracking-widest opacity-40">
                ACTIVE CATALOG VIEW
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('changeTab', { detail: 'sales' }));
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('posView', { detail: 'manage' }));
              }, 50);
            }}
            className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-gray-100 card-shadow hover:border-accent/40 transition-all text-left"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Plus className="w-32 h-32 text-accent transform -rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">Input New Product</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[200px]">Add new drinks or snacks to the active POS menu instantly.</p>
              <div className="mt-6 flex items-center gap-2 text-accent font-black text-xs uppercase tracking-widest">
                Open Menu Manager <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          INVENTORY TRACKER
        </h2>
        
        <div className="flex flex-wrap gap-2">
           {['All', 'In Stock', 'Low Stock'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-gray-400 border border-gray-100 hover:border-primary/20"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Quick Stats */}
        <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Total Items</p>
            <p className="text-2xl font-black text-primary">{items.length}</p>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Low Stock</p>
            <p className="text-2xl font-black text-red-500">{items.filter(i => i.stock <= i.minStock).length}</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Search inventory items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => {
            const isLow = item.stock <= item.minStock;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "bg-white p-6 rounded-[2rem] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6",
                  isLow ? "border-red-100 bg-red-50/20" : "border-gray-100 hover:border-primary/20"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center",
                    isLow ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"
                  )}>
                    <Package className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8">
                  <div className="text-center min-w-[80px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    {isLow ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3" />
                        LOW STOCK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        IN STOCK
                      </span>
                    )}
                  </div>

                  <div className="text-center min-w-[100px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Level</p>
                    <div className="flex items-center justify-center gap-2">
                       <span className={cn(
                        "text-2xl font-black",
                        isLow ? "text-red-500" : "text-gray-900"
                      )}>
                        {item.stock}
                      </span>
                      <span className="text-xs font-bold text-gray-400">{item.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateStock(item.id, -1)}
                      className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => updateStock(item.id, 1)}
                      className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div className="py-20 text-center opacity-20 transform scale-110">
            <Search className="w-20 h-20 mx-auto mb-4" />
            <p className="text-xl font-bold">No inventory items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffInventory;
