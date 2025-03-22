import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaShoppingCart, FaFileInvoice } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { orderService, contactService, invoiceService } from '../services/api';

interface OrderItem {
  product_name: string;
  quantity: number | string;
  price: number | string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    contact_id: '',
    status: 'Pending',
    notes: '',
    items: [{ product_name: '', quantity: 1, price: '' } as OrderItem]
  });

  // Invoice form state
  const [invoiceData, setInvoiceData] = useState({
    order_id: '',
    contact_id: '',
    due_date: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 30); // Default due date: 30 days from now
      return date.toISOString().split('T')[0];
    })(),
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchContacts();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      setOrders(response.data.orders || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await contactService.getContacts();
      setContacts(response.data.contacts || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    
    try {
      await orderService.deleteOrder(selectedOrder.id);
      setOrders(orders.filter(order => order.id !== selectedOrder.id));
      setShowDeleteModal(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order. Please try again.');
    }
  };

  const confirmDelete = (order: any) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleInvoiceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData({
      ...invoiceData,
      [name]: value
    });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: field === 'quantity' || field === 'price' ? 
        (value === '' ? value : Number(value)) : 
        value 
    };
    
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_name: '', quantity: 1, price: '' } as OrderItem]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) {
      return; // Don't remove the last item
    }
    
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const price = parseFloat(item.price as string) || 0;
      const quantity = parseInt(item.quantity as string) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contact_id) {
      setError('Please select a contact');
      return;
    }
    
    if (formData.items.some(item => !item.product_name || !item.price)) {
      setError('Please fill in all product details');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        contact_id: parseInt(formData.contact_id),
        total_amount: calculateTotal()
      };
      
      if (selectedOrder) {
        await orderService.updateOrder(selectedOrder.id, payload);
      } else {
        await orderService.createOrder(payload);
      }
      
      fetchOrders();
      setShowAddModal(false);
      
      // Reset form
      setFormData({
        contact_id: '',
        status: 'Pending',
        notes: '',
        items: [{ product_name: '', quantity: 1, price: '' } as OrderItem]
      });
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error saving order:', err);
      setError('Failed to save order. Please try again.');
    }
  };

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoiceData.order_id || !invoiceData.contact_id) {
      setError('Order and contact information is required');
      return;
    }
    
    try {
      await invoiceService.createInvoice({
        ...invoiceData,
        order_id: parseInt(invoiceData.order_id),
        contact_id: parseInt(invoiceData.contact_id)
      });
      
      // Success - close modal and refresh
      setShowInvoiceModal(false);
      fetchOrders();
      
      // Reset form
      setInvoiceData({
        order_id: '',
        contact_id: '',
        due_date: (() => {
          const date = new Date();
          date.setDate(date.getDate() + 30);
          return date.toISOString().split('T')[0];
        })(),
        notes: ''
      });
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Failed to create invoice. Please try again.');
    }
  };

  const handleEdit = (order: any) => {
    setFormData({
      contact_id: order.contact_id.toString(),
      status: order.status,
      notes: order.notes || '',
      items: order.items || [{ product_name: '', quantity: 1, price: '' } as OrderItem]
    });
    setSelectedOrder(order);
    setShowAddModal(true);
  };

  const prepareInvoice = (order: any) => {
    setInvoiceData({
      order_id: order.id.toString(),
      contact_id: order.contact_id.toString(),
      due_date: (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
      })(),
      notes: `Invoice for order ${order.order_number}`
    });
    setShowInvoiceModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'confirmed':
        return <Badge bg="info">Confirmed</Badge>;
      case 'shipped':
        return <Badge bg="primary">Shipped</Badge>;
      case 'delivered':
        return <Badge bg="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => 
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="h3 mb-0">Orders</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => {
              setSelectedOrder(null);
              setFormData({
                contact_id: '',
                status: 'Pending',
                notes: '',
                items: [{ product_name: '', quantity: 1, price: '' } as OrderItem]
              });
              setShowAddModal(true);
            }}
          >
            <FaPlus className="me-1" /> Create Order
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="mb-0">Manage Orders</h5>
            </Col>
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    <FaTimes />
                  </Button>
                )}
              </InputGroup>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-danger p-3">{error}</div>
          ) : filteredOrders.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.order_number}</td>
                      <td>{order.contact_name}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{formatCurrency(order.total_amount)}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => navigate(`/orders/${order.id}`)}
                            title="View Order"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(order)}
                            title="Edit Order"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => prepareInvoice(order)}
                            title="Create Invoice"
                          >
                            <FaFileInvoice />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => confirmDelete(order)}
                            title="Delete Order"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-5">
              <div className="mb-3">
                <FaShoppingCart size={64} className="text-muted" />
              </div>
              <h4>No orders found</h4>
              <p className="text-muted">You haven't created any orders yet. Get started by creating your first order.</p>
              <Button 
                variant="primary" 
                className="mt-2"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="me-1" /> Create Your First Order
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Order Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedOrder ? 'Edit Order' : 'Create New Order'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {contacts.length === 0 ? (
            <div className="text-center p-3">
              <FaShoppingCart size={48} className="text-muted mb-3" />
              <h5>No Contacts Available</h5>
              <p className="text-muted">You need to create a contact before creating an order.</p>
              <Button
                variant="primary"
                onClick={() => {
                  setShowAddModal(false);
                  navigate('/contacts/new');
                }}
              >
                Create Contact
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Customer</Form.Label>
                <Form.Select 
                  name="contact_id" 
                  value={formData.contact_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a customer</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} {contact.company ? `(${contact.company})` : ''}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  name="status" 
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>

              <div className="mb-3">
                <Form.Label>Order Items</Form.Label>
                {formData.items.map((item, index) => (
                  <Row key={index} className="align-items-end mb-2">
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label className={index > 0 ? 'visually-hidden' : ''}>Product Name</Form.Label>
                        <Form.Control 
                          type="text" 
                          value={item.product_name}
                          onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                          placeholder="Product name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label className={index > 0 ? 'visually-hidden' : ''}>Quantity</Form.Label>
                        <Form.Control 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className={index > 0 ? 'visually-hidden' : ''}>Price</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>$</InputGroup.Text>
                          <Form.Control 
                            type="number" 
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            required
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Button 
                        variant="outline-danger" 
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length <= 1}
                        className="w-100"
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                ))}
                
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <Button variant="outline-secondary" onClick={addItem}>
                    <FaPlus className="me-1" /> Add Item
                  </Button>
                  <h5 className="mb-0">
                    Total: {formatCurrency(calculateTotal())}
                  </h5>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Additional information about this order"
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {selectedOrder ? 'Update Order' : 'Create Order'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Create Invoice Modal */}
      <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Invoice from Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={createInvoice}>
            <Form.Group className="mb-3">
              <Form.Label>Order</Form.Label>
              <Form.Control 
                type="text"
                value={orders.find(o => o.id.toString() === invoiceData.order_id)?.order_number || ''}
                readOnly
              />
              <Form.Control
                type="hidden"
                name="order_id"
                value={invoiceData.order_id}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Customer</Form.Label>
              <Form.Control 
                type="text"
                value={contacts.find(c => c.id.toString() === invoiceData.contact_id)?.name || ''}
                readOnly
              />
              <Form.Control
                type="hidden"
                name="contact_id"
                value={invoiceData.contact_id}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control 
                type="date" 
                name="due_date"
                value={invoiceData.due_date}
                onChange={handleInvoiceInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control 
                as="textarea" 
                name="notes"
                value={invoiceData.notes}
                onChange={handleInvoiceInputChange}
                rows={3}
                placeholder="Additional notes for this invoice"
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowInvoiceModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Invoice
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete order <strong>{selectedOrder?.order_number}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Orders; 