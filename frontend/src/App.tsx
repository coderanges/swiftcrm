import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './App.css';

// Components
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactNew from './pages/ContactNew';
import Leads from './pages/Leads';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceForm from './pages/InvoiceForm';
import Receipts from './pages/Receipts';
import Accounting from './pages/Accounting';
import Login from './pages/Login';
import Register from './pages/Register';

// Context
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navigation />
        <Container fluid className="mt-4">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            } />
            <Route path="/contacts/new" element={
              <ProtectedRoute>
                <ContactNew />
              </ProtectedRoute>
            } />
            <Route path="/leads" element={
              <ProtectedRoute>
                <Leads />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            } />
            <Route path="/invoices/new" element={
              <ProtectedRoute>
                <InvoiceForm />
              </ProtectedRoute>
            } />
            <Route path="/invoices/:id" element={
              <ProtectedRoute>
                <InvoiceDetail />
              </ProtectedRoute>
            } />
            <Route path="/invoices/:id/edit" element={
              <ProtectedRoute>
                <InvoiceForm />
              </ProtectedRoute>
            } />
            <Route path="/receipts" element={
              <ProtectedRoute>
                <Receipts />
              </ProtectedRoute>
            } />
            <Route path="/accounting" element={
              <ProtectedRoute>
                <Accounting />
              </ProtectedRoute>
            } />
          </Routes>
        </Container>
      </div>
    </AuthProvider>
  );
}

export default App; 