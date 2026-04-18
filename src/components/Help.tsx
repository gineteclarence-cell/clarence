import React from 'react';
import { HelpCircle, Book, MessageSquare, Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const Help: React.FC = () => {
  const resources = [
    { title: 'Operational Guide', icon: Book, desc: 'Learn how to manage branches & staff.' },
    { title: 'POS Training', icon: ShieldCheck, desc: 'Security best practices for POS terminals.' },
    { title: 'Support Chat', icon: MessageSquare, desc: 'Chat with MABI technical support.' },
    { title: 'Emergency Contact', icon: Phone, desc: 'Call Franchise Support in real-time.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
          <HelpCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">How can we help?</h2>
        <p className="text-gray-500 font-medium max-w-sm mx-auto italic">
          Welcome to the MABI Centralized Support Hub. How can we assist your franchise today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow hover:border-primary/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary rounded-xl flex items-center justify-center transition-all">
                <res.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{res.title}</h4>
                <p className="text-xs text-gray-500 font-medium">{res.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 text-center">
        <h3 className="text-xl font-bold text-primary mb-2">Technical Dashboard Status</h3>
        <p className="text-sm text-primary/70 mb-6 font-medium">System is operational across all branches. No reported outages.</p>
        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-primary/60 bg-white px-4 py-2 rounded-full border border-primary/10">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
            Street Sync Active
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary/60 bg-white px-4 py-2 rounded-full border border-primary/10">
            <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
            Database Secure
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
