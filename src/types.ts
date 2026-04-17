export type Branch = 'Branch 1' | 'Branch 2' | 'All';

export interface User {
  id: string;
  name: string;
  role: 'Owner' | 'Staff';
  branch: Branch;
  email: string;
}

export interface Transaction {
  id: string;
  staffName: string;
  branch: Exclude<Branch, 'All'>;
  amount: number;
  time: string;
  items: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  category: string;
}

export interface StaffMember {
  id: string;
  name: string;
  branch: Exclude<Branch, 'All'>;
  active: boolean;
  transactionsProcessed: number;
  attendanceLogs: AttendanceLog[];
}

export interface AttendanceLog {
  id: string;
  staffId: string;
  staffName: string;
  branch: string;
  clockIn: string;
  clockOut?: string;
  date: string;
  task?: string;
  isPendingSync?: boolean;
}

export interface SalesKPI {
  todaySales: number;
  lowStockCount: number;
  activeStaffCount: number;
  totalRevenueMTD: number;
}
