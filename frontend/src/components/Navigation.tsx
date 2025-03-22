import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const { authState, logout } = useAuth();
  const location = useLocation();
  
  // Check if the current path matches the given path
  const isActive = (path: string) => location.pathname === path;

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">SwiftCRM</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {authState.isAuthenticated ? (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/" active={isActive('/')}>Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/contacts" active={isActive('/contacts')}>Contacts</Nav.Link>
                <Nav.Link as={Link} to="/leads" active={isActive('/leads')}>Leads</Nav.Link>
                <Nav.Link as={Link} to="/orders" active={isActive('/orders')}>Orders</Nav.Link>
                <Nav.Link as={Link} to="/invoices" active={isActive('/invoices')}>Invoices</Nav.Link>
                <Nav.Link as={Link} to="/receipts" active={isActive('/receipts')}>Receipts</Nav.Link>
                <Nav.Link as={Link} to="/accounting" active={isActive('/accounting')}>Accounting</Nav.Link>
              </Nav>
              <Nav>
                <Nav.Item className="d-flex align-items-center me-3">
                  {authState.user ? `Welcome, ${authState.user.name}` : ''}
                </Nav.Item>
                <Button variant="outline-danger" onClick={() => logout()}>
                  Logout
                </Button>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login" active={isActive('/login')}>Login</Nav.Link>
              <Nav.Link as={Link} to="/register" active={isActive('/register')}>Register</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 