import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { contactService } from '../services/api';

const ContactNew: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: '',
    type: 'Individual',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await contactService.createContact(formData);
      
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        notes: '',
        type: 'Individual',
      });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/contacts');
      }, 1500);
      
    } catch (err) {
      console.error('Error creating contact:', err);
      setError('Failed to create contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Button variant="outline-secondary" onClick={() => navigate('/contacts')}>
            <FaArrowLeft className="me-1" /> Back to Contacts
          </Button>
        </Col>
      </Row>

      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Header>
              <h4 className="mb-0">Create New Contact</h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" className="mb-4">
                  Contact created successfully! Redirecting to contacts list...
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Contact Type</Form.Label>
                      <Form.Select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Individual">Individual</option>
                        <option value="Business">Business</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Full name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email address"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone number"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Company</Form.Label>
                      <Form.Control
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Company name"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street address, city, state, zip"
                        rows={2}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Additional information about this contact"
                        rows={3}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="secondary" 
                    className="me-2" 
                    onClick={() => navigate('/contacts')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading || success}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-1" /> Save Contact
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-4 text-muted">
            <FaUser className="mb-2" size={24} />
            <p>
              Creating a contact will allow you to associate them with leads, orders, invoices, and more.
              <br />
              Contacts are the foundation of your CRM experience.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactNew; 