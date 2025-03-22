import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { invoiceService, contactService, orderService } from '../services/api';
import { Invoice, Contact } from '../types';

interface Order {
  id: number;
  order_number: string;
  contact_name: string;
}

interface InvoiceFormData {
  contact_id: string;
  order_id: string;
  amount: string;
  status: string;
  due_date: string;
  notes: string;
}

const InvoiceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    contact_id: '',
    order_id: '',
    amount: '',
    status: 'Unpaid',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days from now
    notes: ''
  });
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch contacts and orders in parallel
        const [contactsResponse, ordersResponse] = await Promise.all([
          contactService.getContacts(),
          orderService.getOrders()
        ]);
        
        setContacts(contactsResponse.data.contacts || []);
        setOrders(ordersResponse.data.orders || []);
        
        // If editing, fetch the invoice details
        if (isEditing && id) {
          const invoiceResponse = await invoiceService.getInvoice(parseInt(id));
          const invoice = invoiceResponse.data.invoice;
          
          setFormData({
            contact_id: invoice.contact_id.toString(),
            order_id: invoice.order_id ? invoice.order_id.toString() : '',
            amount: invoice.amount.toString(),
            status: invoice.status,
            due_date: new Date(invoice.due_date).toISOString().split('T')[0],
            notes: invoice.notes || ''
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load necessary data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.contact_id) {
      setError('Please select a contact');
      return false;
    }
    
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (!formData.due_date) {
      setError('Please select a due date');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const invoiceData = {
        contact_id: parseInt(formData.contact_id),
        order_id: formData.order_id ? parseInt(formData.order_id) : null,
        amount: parseFloat(formData.amount),
        status: formData.status,
        due_date: formData.due_date,
        notes: formData.notes
      };
      
      if (isEditing && id) {
        await invoiceService.updateInvoice(parseInt(id), invoiceData);
        setSuccessMessage('Invoice updated successfully!');
      } else {
        const response = await invoiceService.createInvoice(invoiceData);
        setSuccessMessage('Invoice created successfully!');
        
        // Navigate to the new invoice after a short delay
        setTimeout(() => {
          navigate(`/invoices/${response.data.invoice.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving invoice:', err);
      setError('Failed to save invoice. Please check your input and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</h1>
        <Button variant="outline-secondary" onClick={() => navigate('/invoices')}>
          <FaArrowLeft className="me-2" /> Back to Invoices
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>
          {successMessage}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <h5 className="mb-0">Invoice Information</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    name="contact_id" 
                    value={formData.contact_id} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a contact</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>{contact.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Related Order</Form.Label>
                  <Form.Select 
                    name="order_id" 
                    value={formData.order_id} 
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {orders.map(order => (
                      <option key={order.id} value={order.id}>
                        {order.order_number} ({order.contact_name})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/invoices')}
                disabled={submitting}
              >
                <FaTimes className="me-2" /> Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner 
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> {isEditing ? 'Update Invoice' : 'Create Invoice'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InvoiceForm; 