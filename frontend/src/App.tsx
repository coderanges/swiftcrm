import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './App.css';

// Components
import Navigation from './components/Navigation';

// Pages
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactNew from './pages/ContactNew';
import Leads from './pages/Leads';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import Receipts from './pages/Receipts';
import Accounting from './pages/Accounting';
import Login from './pages/Login';
import Register from './pages/Register';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navigation />
        <Container fluid className="mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/new" element={<ContactNew />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/receipts" element={<Receipts />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Container>
      </div>
    </AuthProvider>
  );
}

export default App; 