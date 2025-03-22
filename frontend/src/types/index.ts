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
  title: string;
  status: string;
  value: number;
  notes: string;
  contact_id: number;
  contact_name: string;
  created_at: string;
  updated_at: string;
}

// Order types
export interface Order {
  id: number;
  order_number: string;
  contact_id: number;
  contact_name: string;
  status: string;
  total_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  order_id: number;
}

// Invoice types
export interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
  notes: string;
  contact_id: number;
  contact_name: string;
  order_id?: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
  contact?: Contact;
  order?: Order;
  items?: OrderItem[];
  receipts?: Receipt[];
}

// Receipt types
export interface Receipt {
  id: number;
  receipt_number: string;
  amount: number;
  payment_method: string;
  notes: string;
  created_at: string;
  invoice_id: number;
}

// Accounting types
export interface AccountingEntry {
  id: number;
  entry_type: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
} 