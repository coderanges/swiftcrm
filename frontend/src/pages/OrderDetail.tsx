import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaFileInvoice, FaEdit, FaShoppingCart } from 'react-icons/fa';
import { orderService, invoiceService } from '../services/api';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<any | null>(null);
  const [relatedInvoices, setRelatedInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [invoiceLoading, setInvoiceLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      fetchOrder(parseInt(id));
      fetchRelatedInvoices(parseInt(id));
    }
  }, [id]);
  
  const fetchOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const response = await orderService.getOrder(orderId);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRelatedInvoices = async (orderId: number) => {
    try {
      setInvoiceLoading(true);
      const response = await invoiceService.getInvoices();
      // Filter invoices related to this order
      const relatedInvoices = response.data.invoices.filter((invoice: any) => 
        invoice.order_id === orderId
      );
      setRelatedInvoices(relatedInvoices || []);
      setInvoiceError(null);
    } catch (err) {
      console.error('Error fetching related invoices:', err);
      setInvoiceError('Failed to load related invoices.');
    } finally {
      setInvoiceLoading(false);
    }
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
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const handleCreateInvoice = () => {
    navigate(`/invoices/new?orderId=${id}`);
  };
  
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/orders')}>
          <FaArrowLeft className="me-1" /> Back to Orders
        </Button>
      </Container>
    );
  }
  
  if (!order) {
    return (
      <Container>
        <Alert variant="warning">Order not found</Alert>
        <Button variant="primary" onClick={() => navigate('/orders')}>
          <FaArrowLeft className="me-1" /> Back to Orders
        </Button>
      </Container>
    );
  }
  
  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <Button variant="outline-secondary" onClick={() => navigate('/orders')} className="me-2">
            <FaArrowLeft className="me-1" /> Back to Orders
          </Button>
          <Button variant="outline-primary" onClick={() => navigate(`/orders/edit/${id}`)}>
            <FaEdit className="me-1" /> Edit Order
          </Button>
          {relatedInvoices.length === 0 && (
            <Button variant="outline-success" onClick={handleCreateInvoice} className="ms-2">
              <FaFileInvoice className="me-1" /> Create Invoice
            </Button>
          )}
        </Col>
      </Row>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  Order #{order.order_number}
                </h5>
                <div>{getStatusBadge(order.status)}</div>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col sm={6}>
                  <h6 className="text-muted">Customer Information</h6>
                  <p className="mb-1"><strong>Name:</strong> {order.contact_name}</p>
                  {order.contact_email && <p className="mb-1"><strong>Email:</strong> {order.contact_email}</p>}
                  {order.contact_phone && <p className="mb-1"><strong>Phone:</strong> {order.contact_phone}</p>}
                  {order.contact_company && <p className="mb-1"><strong>Company:</strong> {order.contact_company}</p>}
                </Col>
                <Col sm={6}>
                  <h6 className="text-muted">Order Information</h6>
                  <p className="mb-1"><strong>Date:</strong> {formatDate(order.created_at)}</p>
                  <p className="mb-1"><strong>Status:</strong> {order.status}</p>
                  <p className="mb-1"><strong>Total:</strong> {formatCurrency(order.total_amount)}</p>
                </Col>
              </Row>
              
              {order.notes && (
                <div className="mb-4">
                  <h6 className="text-muted">Notes</h6>
                  <p>{order.notes}</p>
                </div>
              )}
              
              <h6 className="text-muted mb-3">Order Items</h6>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items && order.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td>{item.product_name}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">{formatCurrency(item.price)}</td>
                        <td className="text-end">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                      <td className="text-end"><strong>{formatCurrency(order.total_amount)}</strong></td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Related Invoices</h5>
            </Card.Header>
            <Card.Body>
              {invoiceLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : invoiceError ? (
                <Alert variant="danger">{invoiceError}</Alert>
              ) : relatedInvoices.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatedInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td>{invoice.invoice_number}</td>
                          <td>{formatDate(invoice.created_at)}</td>
                          <td>{invoice.paid_status ? 
                            <Badge bg="success">Paid</Badge> : 
                            <Badge bg="warning">Unpaid</Badge>}
                          </td>
                          <td>
                            <Button 
                              variant="outline-info" 
                              size="sm"
                              onClick={() => navigate(`/invoices/${invoice.id}`)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaFileInvoice size={36} className="text-muted mb-3" />
                  <p className="mb-3">No invoices have been created for this order yet.</p>
                  <Button 
                    variant="primary" 
                    onClick={handleCreateInvoice}
                  >
                    <FaFileInvoice className="me-1" /> Create Invoice
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Timeline</h5>
            </Card.Header>
            <Card.Body>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker bg-primary"></div>
                  <div className="timeline-content">
                    <h6 className="mb-0">Order Created</h6>
                    <small className="text-muted">{formatDate(order.created_at)}</small>
                  </div>
                </div>
                
                {/* This would be dynamically generated based on order status updates */}
                {order.status !== 'Pending' && (
                  <div className="timeline-item">
                    <div className="timeline-marker bg-info"></div>
                    <div className="timeline-content">
                      <h6 className="mb-0">Status Updated to {order.status}</h6>
                      <small className="text-muted">{formatDate(order.updated_at || order.created_at)}</small>
                    </div>
                  </div>
                )}
                
                {relatedInvoices.length > 0 && (
                  <div className="timeline-item">
                    <div className="timeline-marker bg-success"></div>
                    <div className="timeline-content">
                      <h6 className="mb-0">Invoice Created</h6>
                      <small className="text-muted">{formatDate(relatedInvoices[0].created_at)}</small>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetail; 