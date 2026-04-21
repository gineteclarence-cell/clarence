import React, { useState, useEffect } from 'react';
import { User, Transaction, MenuItem } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Receipt, Coffee, Utensils, Search, History, Settings, Image as ImageIcon, Tag, Coins, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { MENU_ITEMS as INITIAL_MENU_ITEMS } from '../data/mockData';

interface StaffPOSProps {
  user: User;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

const StaffPOS: React.FC<StaffPOSProps> = ({ user }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTx, setLastTx] = useState<Transaction | null>(null);
  const [personalTransactions, setPersonalTransactions] = useState<Transaction[]>([]);
  const [view, setView] = useState<'pos' | 'history' | 'manage'>('pos');
  const [showMobileCart, setShowMobileCart] = useState(false);
  
  // Menu Management
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Beverage', image: '' });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const savedSales = localStorage.getItem(`sales_${user.id}`);
    if (savedSales) setPersonalTransactions(JSON.parse(savedSales));

    const menuKey = `mabi_pos_menu_${user.branch}`;
    const savedMenu = localStorage.getItem(menuKey);
    const customItems = savedMenu ? JSON.parse(savedMenu) : [];
    setMenuItems([...INITIAL_MENU_ITEMS, ...customItems]);

    const handleViewChange = (e: any) => {
      setView(e.detail);
    };
    window.addEventListener('posView', handleViewChange);
    return () => window.removeEventListener('posView', handleViewChange);
  }, [user.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 2) { // 2MB limit
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct({ ...newProduct, image: reader.result as string });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: MenuItem = {
      id: `m-custom-${Date.now()}`,
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      image: newProduct.image || `https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80`
    };

    const menuKey = `mabi_pos_menu_${user.branch}`;
    const savedMenu = localStorage.getItem(menuKey);
    const customItems = savedMenu ? JSON.parse(savedMenu) : [];
    const updatedCustom = [...customItems, product];
    
    localStorage.setItem(menuKey, JSON.stringify(updatedCustom));
    setMenuItems([...INITIAL_MENU_ITEMS, ...updatedCustom]);
    setNewProduct({ name: '', price: '', category: 'Beverage', image: '' });
    setView('pos');
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.menuItem.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.menuItem.id !== itemId);
    });
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((acc, i) => acc + (i.menuItem.price * i.quantity), 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newTx: Transaction = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      staffName: user.name,
      branch: user.branch as any,
      amount: total,
      time: new Date().toISOString(),
      items: cart.map(i => `${i.menuItem.name} x${i.quantity}`),
    };

    const updatedHistory = [newTx, ...personalTransactions];
    setPersonalTransactions(updatedHistory);
    localStorage.setItem(`sales_${user.id}`, JSON.stringify(updatedHistory));
    
    // Also add to global transactions for owner view simulation
    const globalSales = localStorage.getItem('global_transactions');
    const globalTxs = globalSales ? JSON.parse(globalSales) : [];
    localStorage.setItem('global_transactions', JSON.stringify([newTx, ...globalTxs]));

    setLastTx(newTx);
    setShowReceipt(true);
    setCart([]);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = category === 'All' || item.category === category;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', ...new Set(menuItems.map(i => i.category))];

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)] space-y-4 md:space-y-6">
      {/* Mobile Cart Trigger */}
      {view === 'pos' && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <motion.button 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setShowMobileCart(true)}
            className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center relative border-4 border-white"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </motion.button>
        </div>
      )}

      {/* Mobile Cart Overlay */}
      <AnimatePresence>
        {showMobileCart && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileCart(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-[3rem] p-8 max-h-[85vh] flex flex-col shadow-2xl"
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-8" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-gray-900 flex items-center gap-3 uppercase tracking-widest text-sm">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Your Order
                </h3>
                <button 
                  onClick={clearCart}
                  className="text-xs font-bold text-gray-400 hover:text-red-500"
                >
                  Clear All
                </button>
              </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 mb-8 pr-2">
                {cart.map((item) => (
                  <div key={item.menuItem.id} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                      <img src={item.menuItem.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs md:text-sm text-gray-900 truncate">{item.menuItem.name}</p>
                      <p className="text-[10px] md:text-xs font-black text-accent mt-0.5">₱{(item.menuItem.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-100">
                      <button 
                        onClick={() => removeFromCart(item.menuItem.id)} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-xs min-w-[1rem] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => addToCart(item.menuItem)} 
                        className="w-8 h-8 flex items-center justify-center hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-lg font-black text-gray-900">
                  <span>Total</span>
                  <span className="text-accent">₱{total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => {
                    handleCheckout();
                    setShowMobileCart(false);
                  }}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                >
                  CONFIRM & PAY
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gray-100 pb-4">
        <button 
          onClick={() => setView('pos')}
          className={cn(
            "flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-sm font-black transition-all",
            view === 'pos' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-primary"
          )}
        >
          Sales
        </button>
        <button 
          onClick={() => setView('history')}
          className={cn(
            "flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-sm font-black transition-all",
            view === 'history' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-primary"
          )}
        >
          My Transactions
        </button>
        <button 
          onClick={() => setView('manage')}
          className={cn(
            "w-full md:w-auto px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-sm font-black transition-all border border-transparent",
            view === 'manage' ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-gray-400 hover:text-accent border-accent/10"
          )}
        >
          <Settings className="w-4 h-4 inline-block mr-2" />
          Manage Menu
        </button>
      </div>

      {view === 'pos' ? (
        <div className="flex-1 flex gap-8 min-h-0">
          {/* Menu Section */}
          <div className="flex-1 flex flex-col space-y-6 min-w-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-100 focus:ring-2 focus:ring-primary/10 outline-none transition-all font-medium text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                      category === cat ? "bg-accent text-white border-accent shadow-md" : "bg-white text-gray-400 border-gray-100 hover:border-accent/30"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filteredItems.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(item)}
                    className="bg-white p-3 md:p-4 rounded-3xl border border-gray-100 card-shadow cursor-pointer group hover:border-accent/30 transition-all flex flex-col items-center text-center"
                  >
                    <div className="w-full aspect-square bg-gray-50 rounded-2xl mb-2 md:mb-4 overflow-hidden relative border border-gray-50">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-xs md:text-sm mb-0.5 md:mb-1 line-clamp-1">{item.name}</h4>
                    <p className="text-accent font-black text-xs md:text-sm">₱{item.price.toFixed(2)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="w-96 bg-white rounded-3xl border border-gray-100 card-shadow flex flex-col hidden lg:flex">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest text-xs">
                <ShoppingCart className="w-4 h-4 text-primary" />
                Current Order
              </h3>
              <button 
                onClick={clearCart}
                className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors"
                disabled={cart.length === 0}
              >
                CLEAR ALL
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {cart.map(item => (
                  <motion.div
                    key={item.menuItem.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                      <img src={item.menuItem.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.menuItem.name}</p>
                      <p className="text-xs font-bold text-accent">₱{item.menuItem.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => removeFromCart(item.menuItem.id)}
                        className="p-1 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-primary"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-black text-primary w-4 text-center">{item.quantity}</span>
                      <button 
                         onClick={() => addToCart(item.menuItem)}
                         className="p-1 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-primary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 transform translate-y-1/2">
                    <Receipt className="w-16 h-16 mb-4" />
                    <p className="font-bold text-sm">Cart is empty</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 bg-gray-50/50 space-y-4 border-t border-gray-100">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>VAT (12%)</span>
                  <span>₱{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-accent">₱{total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
              >
                PROCEED TO PAY
              </button>
            </div>
          </div>
        </div>
      ) : view === 'history' ? (
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 card-shadow overflow-hidden flex flex-col">
          <div className="p-8 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
             <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <History className="w-6 h-6 text-primary" />
              Past Transactions
            </h3>
            <div className="text-xs font-bold text-gray-400 uppercase">
              {personalTransactions.length} Transactions found
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white z-10 border-b border-gray-50">
                <tr className="bg-gray-50/30">
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt ID</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Items Sold</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {personalTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-xs font-black border border-primary/10">#{tx.id}</span>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-gray-500">
                      {format(new Date(tx.time), 'hh:mm a')}
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-gray-900 truncate max-w-sm">{tx.items.join(', ')}</p>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-gray-900">
                      ₱{tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {personalTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-20 text-center opacity-20">
                      <History className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-bold">No sales records yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow flex flex-col">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Plus className="w-6 h-6 text-accent" />
              Add New Product
            </h3>
            
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Product Name</label>
                <div className="relative">
                  <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Strawberry Bliss"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:ring-2 focus:ring-accent/10 focus:border-accent/20 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Price (₱)</label>
                   <div className="relative">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="number"
                      required
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:ring-2 focus:ring-accent/10 focus:border-accent/20 outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:ring-2 focus:ring-accent/10 focus:border-accent/20 outline-none transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option>Beverage</option>
                      <option>Snacks</option>
                      <option>Bites</option>
                      <option>Desserts</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Product Image</label>
                <div className="flex flex-col gap-4">
                  <div 
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className={cn(
                      "w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative group",
                      newProduct.image ? "border-accent/50 bg-accent/5" : "border-gray-200 hover:border-accent/40 bg-gray-50"
                    )}
                  >
                    {newProduct.image ? (
                      <>
                        <img src={newProduct.image} className="w-full h-full object-cover" alt="Selected" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          isUploading ? "bg-accent text-white animate-spin" : "bg-white text-gray-400"
                        )}>
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {isUploading ? "Reading File..." : "Click to Upload Photo"}
                        </p>
                      </>
                    )}
                  </div>
                  <input 
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {!newProduct.image && (
                    <p className="text-[10px] text-gray-400 font-medium italic">
                      No photo? We'll auto-generate a placeholder based on the product name.
                    </p>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-accent text-white rounded-2xl font-black text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                CREATE MENU ITEM
              </button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 card-shadow flex flex-col">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-primary" />
              Live Preview
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-xs bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 flex flex-col items-center text-center shadow-lg transform rotate-2">
                <div className="w-full aspect-square bg-white rounded-3xl mb-6 shadow-inner overflow-hidden border border-gray-100">
                  <img 
                    src={newProduct.image || `https://picsum.photos/seed/${newProduct.name || 'preview'}/200/200`} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h4 className="font-black text-gray-900 text-xl mb-2">{newProduct.name || 'Your Menu Item'}</h4>
                <p className="text-accent font-black text-2xl tracking-tighter">₱{(parseFloat(newProduct.price) || 0).toFixed(2)}</p>
                <div className="mt-6 px-4 py-1.5 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-widest">{newProduct.category}</div>
              </div>
              <p className="mt-8 text-xs font-bold text-gray-400 text-center max-w-xs">This is how your product will appear in the Point of Sale grid.</p>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Receipt Modal */}
      <AnimatePresence>
        {showReceipt && lastTx && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceipt(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Transaction Success</h2>
              <p className="text-sm font-medium text-gray-400 mb-8 lowercase tracking-widest uppercase">ID: {lastTx.id}</p>
              
              <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 space-y-4">
                <div className="flex justify-between items-center text-sm font-black">
                  <span className="text-gray-400 font-bold">Total Paid</span>
                  <span className="text-primary text-xl font-black">₱{lastTx.amount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sold items</p>
                  <ul className="text-xs font-bold text-gray-600 space-y-1">
                    {lastTx.items.map((it, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Coffee className="w-3 h-3 text-accent" /> {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowReceipt(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                DONE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffPOS;
