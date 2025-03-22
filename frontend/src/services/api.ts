import axios from 'axios';

// Create an instance of axios with default config
const api = axios.create({
  baseURL: '/api',  // Use the proxy in package.json
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // This enables cookies to be sent with requests
});

// Add request interceptor to set authorization header
api.interceptors.request.use(
  (config) => {
    config.withCredentials = true; // Ensure credentials are sent with every request
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle session expiration or unauthorized access
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email: string, password: string) => 
    api.post('/login', { email, password }),
  
  register: (name: string, email: string, password: string) => 
    api.post('/register', { name, email, password }),
  
  logout: () => 
    api.post('/logout'),
  
  getCurrentUser: () => 
    api.get('/check-auth')
};

// Contact services
export const contactService = {
  getContacts: () => 
    api.get('/contacts'),
  
  getContact: (id: number) => 
    api.get(`/contacts/${id}`),
  
  createContact: (contact: any) => 
    api.post('/contacts', contact),
  
  updateContact: (id: number, contact: any) => 
    api.put(`/contacts/${id}`, contact),
  
  deleteContact: (id: number) => 
    api.delete(`/contacts/${id}`)
};

// Lead services
export const leadService = {
  getLeads: () => 
    api.get('/leads'),
  
  getLead: (id: number) => 
    api.get(`/leads/${id}`),
  
  createLead: (lead: any) => 
    api.post('/leads', lead),
  
  updateLead: (id: number, lead: any) => 
    api.put(`/leads/${id}`, lead),
  
  deleteLead: (id: number) => 
    api.delete(`/leads/${id}`)
};

// Order services
export const orderService = {
  getOrders: () => 
    api.get('/orders'),
  
  getOrder: (id: number) => 
    api.get(`/orders/${id}`),
  
  createOrder: (order: any) => 
    api.post('/orders', order),
  
  updateOrder: (id: number, order: any) => 
    api.put(`/orders/${id}`, order),
  
  deleteOrder: (id: number) => 
    api.delete(`/orders/${id}`)
};

// Invoice services
export const invoiceService = {
  getInvoices: () => 
    api.get('/invoices'),
  
  getInvoice: (id: number) => 
    api.get(`/invoices/${id}`),
  
  createInvoice: (invoice: any) => 
    api.post('/invoices', invoice),
  
  updateInvoice: (id: number, invoice: any) => 
    api.put(`/invoices/${id}`, invoice),
  
  deleteInvoice: (id: number) => 
    api.delete(`/invoices/${id}`)
};

// Receipt services
export const receiptService = {
  getReceipts: () => 
    api.get('/receipts'),
  
  getReceipt: (id: number) => 
    api.get(`/receipts/${id}`),
  
  createReceipt: (receipt: any) => 
    api.post('/receipts', receipt),
  
  updateReceipt: (id: number, receipt: any) => 
    api.put(`/receipts/${id}`, receipt),
  
  deleteReceipt: (id: number) => 
    api.delete(`/receipts/${id}`)
};

// Accounting services
export const accountingService = {
  getEntries: () => 
    api.get('/accounting/entries'),
  
  getEntry: (id: number) => 
    api.get(`/accounting/entries/${id}`),
  
  createEntry: (entry: any) => 
    api.post('/accounting/entries', entry),
  
  updateEntry: (id: number, entry: any) => 
    api.put(`/accounting/entries/${id}`, entry),
  
  deleteEntry: (id: number) => 
    api.delete(`/accounting/entries/${id}`),
    
  getSummary: (period: string) =>
    api.get(`/accounting/summary?period=${period}`)
};

export default api; 