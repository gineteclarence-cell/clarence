import React, { useState, useEffect } from 'react';
import { InventoryItem, User, InventoryLog, InventoryRequest, MenuItem } from '../types';
import { Package, AlertCircle, CheckCircle2, RefreshCw, Search, Plus, Minus, ArrowRight, ClipboardList, Send, X, Info, Camera, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { INVENTORY as INITIAL_INVENTORY, MOCK_REQUESTS } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface StaffInventoryProps {
  user: User;
}

const StaffInventory: React.FC<StaffInventoryProps> = ({ user }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Low Stock' | 'In Stock'>('All');
  const [updating, setUpdating] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState<InventoryItem | null>(null);
  const [requestItemSearch, setRequestItemSearch] = useState('');
  const [requestQty, setRequestQty] = useState(1);
  const [pendingRequests, setPendingRequests] = useState<InventoryRequest[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Coffee',
    price: 0,
    initialStock: 10,
    unit: 'pcs',
    image: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('mabi_inventory');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems(INITIAL_INVENTORY);
      localStorage.setItem('mabi_inventory', JSON.stringify(INITIAL_INVENTORY));
    }

    const savedRequests = localStorage.getItem('mabi_inventory_requests');
    if (savedRequests) {
      setPendingRequests(JSON.parse(savedRequests));
    }

    const handleStorage = () => {
      const updatedRequests = localStorage.getItem('mabi_inventory_requests');
      if (updatedRequests) setPendingRequests(JSON.parse(updatedRequests));
      
      const updatedInv = localStorage.getItem('mabi_inventory');
      if (updatedInv) setItems(JSON.parse(updatedInv));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRequesting) return;

    const newRequest: InventoryRequest = {
      id: `REQ-${Date.now()}`,
      itemId: isRequesting.id,
      itemName: isRequesting.name,
      quantity: requestQty,
      unit: isRequesting.unit,
      branch: user.branch as any,
      staffName: user.name,
      status: 'pending',
      time: new Date().toISOString()
    };

    const savedRequests = localStorage.getItem('mabi_inventory_requests');
    const allRequests: InventoryRequest[] = savedRequests ? JSON.parse(savedRequests) : MOCK_REQUESTS;
    const updated = [newRequest, ...allRequests];
    localStorage.setItem('mabi_inventory_requests', JSON.stringify(updated));
    setPendingRequests(updated);
    setIsRequesting(null);
    setRequestQty(1);
    
    // alert("Reorder request sent to owner for approval!");
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0) return;

    const id = `prod-${Date.now()}`;
    
    // 1. Add to POS Menu
    const savedMenu = localStorage.getItem('mabi_pos_menu');
    const menu: MenuItem[] = savedMenu ? JSON.parse(savedMenu) : [];
    const newMenuItem: MenuItem = {
      id: id,
      name: newProduct.name,
      price: newProduct.price,
      category: newProduct.category,
      image: newProduct.image || "https://picsum.photos/seed/" + newProduct.name + "/400/300"
    };
    localStorage.setItem('mabi_pos_menu', JSON.stringify([newMenuItem, ...menu]));

    // 2. Add to Inventory
    const newInvItem: InventoryItem = {
      id: id,
      name: newProduct.name,
      category: newProduct.category,
      stock: newProduct.initialStock,
      minStock: 5,
      unit: newProduct.unit
    };
    const updatedItems = [newInvItem, ...items];
    saveItems(updatedItems);

    setIsAddingProduct(false);
    setNewProduct({ name: '', category: 'Coffee', price: 0, initialStock: 10, unit: 'pcs', image: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large (max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const myRequests = pendingRequests.filter(r => r.staffName === user.name && r.branch === user.branch);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const isLow = item.stock <= item.minStock;
    if (filter === 'Low Stock' && !isLow) return false;
    if (filter === 'In Stock' && isLow) return false;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full space-y-8">
      <AnimatePresence>
        {isRequesting && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequesting(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-900 uppercase italic">Reorder Request</h3>
                <button 
                  onClick={() => setIsRequesting(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Item to Stock</label>
                    <div className="relative">
                      {isRequesting.id !== 'new' ? (
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex justify-between items-center group">
                          <div>
                            <p className="font-bold text-gray-900">{isRequesting.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Current: {isRequesting.stock} {isRequesting.unit}</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setIsRequesting({ id: 'new', name: '', stock: 0, minStock: 0, unit: 'units', category: '' })}
                            className="text-[10px] font-black text-primary hover:underline"
                          >
                            CHANGE
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              type="text"
                              placeholder="Search item name..."
                              value={requestItemSearch}
                              onChange={(e) => setRequestItemSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 bg-white shadow-inner">
                            {items.filter(it => it.name.toLowerCase().includes(requestItemSearch.toLowerCase())).map(it => (
                              <button
                                key={it.id}
                                type="button"
                                onClick={() => {
                                  setIsRequesting(it);
                                  setRequestItemSearch('');
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center transition-colors"
                              >
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{it.name}</p>
                                  <p className="text-[10px] text-gray-400 font-black uppercase">{it.category}</p>
                                </div>
                                <span className={cn(
                                  "text-[10px] font-black px-2 py-0.5 rounded-lg",
                                  it.stock <= it.minStock ? "bg-red-50 text-red-600" : "bg-teal-50 text-teal-600"
                                )}>
                                  {it.stock} {it.unit}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity to Reorder</label>
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => setRequestQty(Math.max(1, requestQty - 1))}
                        className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-black transition-colors border border-gray-100"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="flex-1 text-center font-mono">
                        <span className="text-3xl font-black text-black">{requestQty}</span>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{isRequesting.id !== 'new' ? isRequesting.unit : 'units'}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setRequestQty(requestQty + 1)}
                        className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-black transition-colors border border-gray-100"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isRequesting.id === 'new'}
                  className="w-full py-4 bg-black text-primary rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:grayscale"
                >
                  <Send className="w-4 h-4" /> SEND REQUEST
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingProduct(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-900 uppercase italic">Add New Product</h3>
                <button 
                  onClick={() => setIsAddingProduct(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div 
                    className={cn(
                      "w-full h-40 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden relative group transition-all",
                      newProduct.image ? "border-primary/20 bg-gray-50" : "border-gray-200 hover:border-primary/20 hover:bg-primary/5"
                    )}
                  >
                    {newProduct.image ? (
                      <>
                        <img 
                          src={newProduct.image} 
                          className="w-full h-full object-cover" 
                          alt="Preview" 
                        />
                        <button 
                          type="button"
                          onClick={() => setNewProduct({ ...newProduct, image: '' })}
                          className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer p-6">
                        <Camera className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Photo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload} 
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input 
                    required
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold text-sm focus:bg-white focus:border-primary/20 transition-all"
                    placeholder="e.g. Spanish Latte"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold text-xs"
                    >
                      {['Coffee', 'Non-Coffee', 'Tea', 'Snacks', 'Others'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₱)</label>
                    <input 
                      required
                      type="number"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Stock</label>
                    <input 
                      required
                      type="number"
                      value={newProduct.initialStock || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, initialStock: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                    <input 
                      required
                      type="text"
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-black text-primary rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                  >
                    REGISTER PRODUCT
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={() => {
              setIsRequesting({ id: 'new', name: '', stock: 0, minStock: 0, unit: 'units', category: '' });
              setRequestItemSearch('');
            }}
            className="group relative overflow-hidden bg-black p-8 rounded-3xl border border-black/20 card-shadow transition-all text-left"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity">
              <Send className="w-32 h-32 text-primary transform rotate-12" />
            </div>
            <div className="relative z-10 text-primary">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <Send className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-white mb-2">Request Reorder</h4>
              <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-[200px]">Send replenishment requests to the owner for low-stock items.</p>
              <div className="mt-6 flex items-center gap-2 font-black text-xs uppercase tracking-widest text-primary">
                SUBMIT NEW REQUEST <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "group relative overflow-hidden bg-white p-8 rounded-3xl border border-gray-100 card-shadow hover:border-primary/20 transition-all text-left",
              pendingRequests.some(r => r.status === 'pending') && "border-amber-200 bg-amber-50/10"
            )}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity">
              <ClipboardList className="w-32 h-32 text-primary transform -rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">My Requests</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[200px]">Track your replenishment requests (Pending, Approved, Declined).</p>
              <div className="mt-6 flex items-center gap-2">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                  myRequests.some(r => r.status === 'pending') 
                    ? "bg-amber-100 text-amber-600 animate-pulse" 
                    : "bg-gray-100 text-gray-400"
                )}>
                  {myRequests.filter(r => r.status === 'pending').length} PENDING APPROVAL
                </span>
                {myRequests.some(r => r.status === 'pending') && (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
              </div>
            </div>
          </button>

          <button 
            onClick={() => setIsAddingProduct(true)}
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
              <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[200px]">Add new drinks or snacks to the branch menu instantly.</p>
              <div className="mt-6 flex items-center gap-2 text-accent font-black text-xs uppercase tracking-widest">
                START REGISTRATION <ArrowRight className="w-4 h-4" />
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
                    <button 
                      onClick={() => setIsRequesting(item)}
                      className="ml-2 w-10 h-10 bg-black text-primary rounded-xl flex items-center justify-center hover:brightness-110 transition-all shadow-sm active:scale-90"
                      title="Request Reorder"
                    >
                      <ClipboardList className="w-4 h-4" />
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

      {/* Reorder Request History Section */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <ClipboardList className="w-7 h-7 text-primary" />
                    Request History
                  </h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Monitor approval status from branch manager</p>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-xs font-black text-gray-400 hover:text-black transition-colors"
                >
                  CLOSE HISTORY
                </button>
              </div>

                <div className="mb-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-primary/80">
                  <span className="font-black">Staff Notice:</span> You can view your approved, declined, or pending requests here. Stock updates automatically upon <span className="font-black underline text-green-600">Approval</span>.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Name</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested on</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-gray-900">{req.itemName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{req.id}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-black text-primary">{req.quantity}</span>
                          <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">{req.unit}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-700">{new Date(req.time).toLocaleDateString()}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(req.time).toLocaleTimeString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border",
                            req.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                            req.status === 'approved' ? "bg-green-50 text-green-600 border-green-100" :
                            "bg-red-50 text-red-600 border-red-100"
                          )}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myRequests.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-400 italic text-sm">
                          You haven't made any reorder requests yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffInventory;
