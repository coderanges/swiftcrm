import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { authState, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <Container>
      <div className="auth-form">
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Login</h2>
            
            {authState.error && (
              <Alert variant="danger">{authState.error}</Alert>
            )}

            <Form onSubmit={handleSubmit}>
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

              <Button 
                className="w-100 mt-3" 
                variant="primary" 
                type="submit" 
                disabled={authState.loading}
              >
                {authState.loading ? 'Loading...' : 'Login'}
              </Button>
            </Form>

            <div className="w-100 text-center mt-3">
              Don't have an account? <Link to="/register">Register</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Login; 