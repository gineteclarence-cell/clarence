import React, { useEffect } from 'react';
import { Branch, SalesKPI } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { TrendingUp, AlertTriangle, Users, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { getSalesTrends, getProductPerformance, getStaffKPIs } from '../data/mockData';
import { motion } from 'motion/react';

interface DashboardProps {
  branch: Branch;
}

const Dashboard: React.FC<DashboardProps> = ({ branch }) => {
  const salesData = getSalesTrends(branch);
  const pieData = getProductPerformance(branch);
  const staffData = getStaffKPIs(branch);
  
  const COLORS = ['#0f4c5c', '#e36414', '#55a630', '#ffb703', '#219ebc'];

  useEffect(() => {
    // Simulate detecting a sales anomaly
    const timer = setTimeout(() => {
      const anomaly = Math.random() > 0.7;
      if (anomaly) {
        console.warn("System Alert: Sales anomaly detected in Branch 2 - Unusually high transaction volume.");
        // We could use a toast library here, but for now we'll just log or use a local state.
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const kpis = [
    { title: "Today's Sales", value: formatCurrency(12450.50), icon: Wallet, trend: "+12%", up: true, color: "blue" },
    { title: "Low Stock Items", value: "3", icon: AlertTriangle, trend: "Requires attention", up: false, color: "orange" },
    { title: "Active Staff", value: branch === 'All' ? "3" : "2", icon: Users, trend: "Currently on shift", up: true, color: "teal" },
    { title: "Total Revenue (MTD)", value: formatCurrency(352400.00), icon: TrendingUp, trend: "+8.4%", up: true, color: "green" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <kpi.icon className="w-6 h-6 text-primary" />
              </div>
              <div className={cn(
                "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                kpi.up ? "text-green-600 bg-green-50" : "text-orange-600 bg-orange-50"
              )}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            Sales Trends <span className="text-xs font-normal text-gray-500">(Past 7 Days)</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#0f4c5c" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#0f4c5c', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Product Performance</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 - Staff KPIs */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Staff KPIs (Transactions per shift)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={staffData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="transactions" fill="#e36414" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
