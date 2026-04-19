import { Transaction, InventoryItem, StaffMember, AttendanceLog, MenuItem, AppNotification, SalesKPI, InventoryRequest } from '../types';
import { subDays, startOfMonth, format, isAfter, subHours, subMinutes } from 'date-fns';

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Low Stock Alert',
    message: 'Milk Tea stock is below minimum level (15 units remaining).',
    time: subMinutes(new Date(), 10).toISOString(),
    type: 'warning',
    read: false,
  },
  {
    id: 'n2',
    title: 'New Staff Task',
    message: 'Alice Santos just completed preparing 50 batches of milk tea.',
    time: subHours(new Date(), 2).toISOString(),
    type: 'success',
    read: false,
  },
  {
    id: 'n3',
    title: 'Branch 2 Sync',
    message: 'Weekly sales data successfully synced to the central server.',
    time: subHours(new Date(), 5).toISOString(),
    type: 'info',
    read: true,
  },
  {
    id: 'n4',
    title: 'System Update',
    message: 'MABI v1.4.2 is now live with improved offline sync.',
    time: subDays(new Date(), 1).toISOString(),
    type: 'info',
    read: true,
  }
];

export const MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Classic Milk Tea', price: 85, category: 'Beverage', image: 'https://picsum.photos/seed/milktea/200/200' },
  { id: 'm2', name: 'Hokkaido Milk Tea', price: 95, category: 'Beverage', image: 'https://picsum.photos/seed/hokkaido/200/200' },
  { id: 'm3', name: 'Okinawa Milk Tea', price: 95, category: 'Beverage', image: 'https://picsum.photos/seed/okinawa/200/200' },
  { id: 'm4', name: 'Premium Fries', price: 55, category: 'Snacks', image: 'https://picsum.photos/seed/fries/200/200' },
  { id: 'm5', name: 'Beef Siomai (4pcs)', price: 45, category: 'Snacks', image: 'https://picsum.photos/seed/siomai/200/200' },
  { id: 'm6', name: 'Burger Bites', price: 65, category: 'Snacks', image: 'https://picsum.photos/seed/burger/200/200' },
];

export const INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Milk Tea', stock: 15, minStock: 20, unit: 'Liters', category: 'Beverage' },
  { id: '2', name: 'Fries', stock: 45, minStock: 10, unit: 'Kg', category: 'Snacks' },
  { id: '3', name: 'Siomai', stock: 8, minStock: 15, unit: 'Packs', category: 'Snacks' },
  { id: '4', name: 'Water', stock: 100, minStock: 20, unit: 'Bottles', category: 'Beverage' },
  { id: '5', name: 'Juice', stock: 5, minStock: 10, unit: 'Liters', category: 'Beverage' },
];

export const STAFF: StaffMember[] = [
  { id: 'st-01', name: 'Alice Santos', branch: 'Branch 1', accessCode: '101001', active: true, transactionsProcessed: 124, attendanceLogs: [] },
  { id: 'st-02', name: 'Bob Reyes', branch: 'Branch 1', accessCode: '101002', active: false, transactionsProcessed: 89, attendanceLogs: [] },
  { id: 'st-03', name: 'Charlie Cruz', branch: 'Branch 2', accessCode: '202003', active: true, transactionsProcessed: 156, attendanceLogs: [] },
  { id: 'st-04', name: 'Diana Lim', branch: 'Branch 2', accessCode: '202004', active: true, transactionsProcessed: 42, attendanceLogs: [] },
  { id: 'st-05', name: 'Elena Gomez', branch: 'Branch 1', accessCode: '101005', active: false, transactionsProcessed: 12, attendanceLogs: [] },
  { id: 'st-06', name: 'Fred Dizon', branch: 'Branch 2', accessCode: '202006', active: false, transactionsProcessed: 67, attendanceLogs: [] },
];

// Generate Attendance Logs
STAFF.forEach(staff => {
  for (let i = 0; i < 7; i++) {
    const date = subDays(new Date(), i);
    staff.attendanceLogs.push({
      id: `att-${staff.id}-${i}`,
      staffId: staff.id,
      staffName: staff.name,
      branch: staff.branch,
      date: format(date, 'yyyy-MM-dd'),
      clockIn: format(date, "yyyy-MM-dd'T'08:00:00"),
      clockOut: format(date, "yyyy-MM-dd'T'17:00:00"),
      task: i % 2 === 0 ? 'Prepared milk tea' : 'Cleaned equipment',
    });
  }
});

// Generate Transactions
export const TRANSACTIONS: Transaction[] = [];
for (let i = 0; i < 50; i++) {
  const date = subDays(new Date(), Math.floor(i / 5));
  const branch = i % 2 === 0 ? 'Branch 1' : 'Branch 2';
  const staff = STAFF.find(s => s.branch === branch);
  
  TRANSACTIONS.push({
    id: `TX-${1000 + i}`,
    staffName: staff?.name || 'Admin',
    branch: branch,
    amount: Math.floor(Math.random() * 500) + 50,
    time: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
    items: ['Milk Tea', 'Fries'],
  });
}

export const MOCK_REQUESTS: InventoryRequest[] = [
  {
    id: 'REQ-001',
    itemId: '1',
    itemName: 'Milk Tea',
    quantity: 50,
    unit: 'Liters',
    branch: 'Branch 1',
    staffName: 'Alice Santos',
    status: 'pending',
    time: subHours(new Date(), 2).toISOString()
  },
  {
    id: 'REQ-002',
    itemId: '3',
    itemName: 'Siomai',
    quantity: 10,
    unit: 'Packs',
    branch: 'Branch 2',
    staffName: 'Charlie Cruz',
    status: 'pending',
    time: subHours(new Date(), 5).toISOString()
  },
  {
    id: 'REQ-003',
    itemId: '2',
    itemName: 'Fries',
    quantity: 20,
    unit: 'Kg',
    branch: 'Branch 1',
    staffName: 'Bob Reyes',
    status: 'approved',
    time: subDays(new Date(), 1).toISOString()
  }
];

export const getSalesTrends = (branch: string) => {
  const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
  return days.map(day => {
    const dayStr = format(day, 'MMM dd');
    const dayTransactions = TRANSACTIONS.filter(t => 
      format(new Date(t.time), 'MMM dd') === dayStr && 
      (branch === 'All' || t.branch === branch)
    );
    return {
      name: dayStr,
      sales: dayTransactions.reduce((acc, t) => acc + t.amount, 0),
    };
  });
};

export const getProductPerformance = (branch: string) => {
  const products = ['Milk Tea', 'Fries', 'Siomai', 'Water', 'Juice'];
  return products.map(p => ({
    name: p,
    value: Math.floor(Math.random() * 100) + 20,
  }));
};

export const getStaffKPIs = (branch: string) => {
  return STAFF.filter(s => branch === 'All' || s.branch === branch).map(s => ({
    name: s.name,
    transactions: s.transactionsProcessed,
  }));
};

export const getKpis = (branch: string): SalesKPI => {
  const branchStaff = STAFF.filter(s => branch === 'All' || s.branch === branch);
  const branchTx = TRANSACTIONS.filter(t => branch === 'All' || t.branch === branch);
  const branchInventory = INVENTORY; // Usually this would be filtered too

  return {
    todaySales: branchTx.filter(t => format(new Date(t.time), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
      .reduce((acc, t) => acc + t.amount, 0),
    lowStockCount: branchInventory.filter(i => i.stock <= i.minStock).length,
    activeStaffCount: branchStaff.filter(s => s.active).length,
    totalRevenueMTD: branchTx.filter(t => isAfter(new Date(t.time), startOfMonth(new Date())))
      .reduce((acc, t) => acc + t.amount, 0)
  };
};
