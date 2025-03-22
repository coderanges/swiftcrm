import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { authState, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Proceed with registration
    await register(name, email, password);
  };

  return (
    <Container>
      <div className="auth-form">
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Register</h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {authState.error && <Alert variant="danger">{authState.error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Full Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter your full name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Confirm your password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button 
                className="w-100 mt-3" 
                variant="primary" 
                type="submit" 
                disabled={authState.loading}
              >
                {authState.loading ? 'Loading...' : 'Register'}
              </Button>
            </Form>

            <div className="w-100 text-center mt-3">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Register; 