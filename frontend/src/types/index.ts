// User types
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Contact types
export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Lead types
export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  source: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Order types
export interface OrderItem {
  id: number;
  order_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: number;
  contact_id: number;
  contact_name: string;
  order_date: string;
  status: string;
  total_amount: number;
  notes: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// Invoice types
export interface Invoice {
  id: number;
  order_id: number;
  contact_id: number;
  contact_name: string;
  invoice_date: string;
  due_date: string;
  status: string;
  total_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Receipt types
export interface Receipt {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// Accounting types
export interface AccountingEntry {
  id: number;
  entry_date: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  reference_id?: number;
  reference_type?: string;
  created_at: string;
  updated_at: string;
} 