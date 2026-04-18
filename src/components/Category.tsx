import React from 'react';
import { Branch } from '../types';
import { Package, Tag, Filter, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const Category: React.FC<{ branch: Branch }> = ({ branch }) => {
  const categories = [
    { name: 'Beverages', items: 12, status: 'Active', color: 'bg-blue-500' },
    { name: 'Snacks', items: 8, status: 'Active', color: 'bg-orange-500' },
    { name: 'Packaging', items: 5, status: 'Restricted', color: 'bg-gray-500' },
    { name: 'Ingredients', items: 24, status: 'Active', color: 'bg-teal-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <motion.div 
            key={cat.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow hover:border-primary/20 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                <Tag className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                cat.status === 'Active' ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-500'
              }`}>
                {cat.status}
              </span>
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">{cat.name}</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">{cat.items} Products Tracked</p>
            <div className="flex items-center justify-between text-primary font-bold text-xs uppercase group-hover:gap-2 transition-all">
              <span>View Collection</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900 tracking-tight">Category Mapping ({branch})</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Hierarchical view of your store inventory</p>
          </div>
          <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" /> Sort Rules
          </button>
        </div>
        <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-300" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Configure Branch Categories</h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Organize your items into custom categories for better reporting and inventory tracking in {branch === 'All' ? 'all branches' : branch}.
            </p>
            <button className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                Create New Category
            </button>
        </div>
      </div>
    </div>
  );
};

export default Category;
