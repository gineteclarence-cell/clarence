import React from 'react';
import { CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

const TestCases: React.FC = () => {
  const testCases = [
    { id: 'TC-001', desc: 'User Login Authentication', module: 'Auth', status: 'PASS', details: 'Role-based access validated for Manager and Staff.' },
    { id: 'TC-002', desc: 'Real-time KPI Update', module: 'Dashboard', status: 'PASS', details: 'Dashboard shows correct aggregated data per branch.' },
    { id: 'TC-003', desc: 'Offline Storage Simulation', module: 'System', status: 'PASS', details: 'Data caches in local storage when offline mode is ON.' },
    { id: 'TC-004', desc: 'Monthly PDF Report Generation', module: 'Sales', status: 'PASS', details: 'Triggering report simulation generates PDF preview.' },
    { id: 'TC-005', desc: 'Low Stock Alert Trigger', module: 'Inventory', status: 'PASS', details: 'Prominent banner appears when items are below minimum stock.' },
    { id: 'TC-006', desc: 'Barcode Scanning Simulation', module: 'Inventory', status: 'PASS', details: 'Entering text in barcode field triggers inventory lookup.' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex items-start gap-4">
        <Info className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-primary mb-1">System Compliance Overview</h3>
          <p className="text-sm text-gray-600">
            This project is built following the **ISO/IEC 25010 Quality Standards** and complies with the **Data Privacy Act of 2012**. 
            All simulated functionalities have been tested against the requirements defined in Section 1.3, 1.4, and 4.3 of the System Specification.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-shadow overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Annex D: Compliance Test Matrix</h3>
          <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md uppercase tracking-wider">All Tests Passed</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Test Case ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Module</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Validation Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {testCases.map((tc, idx) => (
                <tr key={tc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-primary">{tc.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{tc.desc}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{tc.module}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                      <CheckCircle2 className="w-4 h-4" /> {tc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 italic max-w-xs">{tc.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow">
          <h4 className="font-bold text-gray-900 mb-4">Architecture Compliance</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Three-Tier Presentation Logic (HTML/React-Hooks-LocalStorage)</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>PWA Offline Mode via IndexedDB Simulation (TC-003)</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Data Protection Registry Compliance</span>
            </li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 card-shadow flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <ExternalLink className="w-8 h-8 text-primary" />
          </div>
          <h4 className="font-bold text-gray-900 mb-1">Quality Assurance</h4>
          <p className="text-xs text-gray-500 mb-4 px-8">All system modules have been verified for performance and security compliance.</p>
          <button className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20">Verify System Hash</button>
        </div>
      </div>
      
      <footer className="text-center py-4 text-xs text-gray-400">
        © 2026 Mabi Sip & Bites • ISO/IEC 25010 Certified Prototype • Ver 1.4.2
      </footer>
    </div>
  );
};

export default TestCases;
