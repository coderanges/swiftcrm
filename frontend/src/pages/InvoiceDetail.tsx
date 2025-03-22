import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaTrash, FaFileInvoiceDollar, FaReceipt, FaPrint } from 'react-icons/fa';
import { invoiceService } from '../services/api';
import { Invoice } from '../types';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchInvoice(parseInt(id));
    }
  }, [id]);

  const fetchInvoice = async (invoiceId: number) => {
    try {
      setLoading(true);
      const response = await invoiceService.getInvoice(invoiceId);
      setInvoice(response.data.invoice);
      setError(null);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Failed to load invoice details. The invoice may not exist or you may not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge bg="secondary">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge bg="success">Paid</Badge>;
      case 'partial':
        return <Badge bg="warning">Partial</Badge>;
      default:
        return <Badge bg="danger">Unpaid</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handlePrint = () => {
    window.print();
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

  if (error) {
    return (
      <Container>
        <Alert variant="danger" className="mt-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={() => navigate('/invoices')}>
              Back to Invoices
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!invoice) {
    return (
      <Container>
        <Alert variant="warning" className="mt-4">
          <Alert.Heading>Invoice Not Found</Alert.Heading>
          <p>We couldn't find the invoice you're looking for.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-warning" onClick={() => navigate('/invoices')}>
              Back to Invoices
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={() => navigate('/invoices')}>
          <FaArrowLeft className="me-2" /> Back to Invoices
        </Button>
        <div>
          <Button variant="outline-primary" className="me-2" onClick={handlePrint}>
            <FaPrint className="me-2" /> Print
          </Button>
          <Button 
            variant="outline-secondary" 
            className="me-2" 
            onClick={() => navigate(`/invoices/${id}/edit`)}
          >
            <FaEdit className="me-2" /> Edit
          </Button>
          <Button variant="outline-success" className="me-2">
            <FaReceipt className="me-2" /> Add Payment
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <FaFileInvoiceDollar className="me-2" /> Invoice #{invoice.invoice_number}
            </h4>
            {getStatusBadge(invoice.status)}
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5>Invoice To:</h5>
              <p className="mb-0"><strong>{invoice.contact_name}</strong></p>
              {invoice.contact?.company && <p className="mb-0">{invoice.contact.company}</p>}
              {invoice.contact?.email && <p className="mb-0">{invoice.contact.email}</p>}
              {invoice.contact?.phone && <p className="mb-0">{invoice.contact.phone}</p>}
              {invoice.contact?.address && <p className="mb-0">{invoice.contact.address}</p>}
            </Col>
            <Col md={6} className="text-md-end">
              <h5>Invoice Details:</h5>
              <p className="mb-0"><strong>Invoice Date:</strong> {formatDate(invoice.created_at)}</p>
              <p className="mb-0"><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>
              <p className="mb-0">
                <strong>Status:</strong> {invoice.status}
              </p>
              {invoice.order && (
                <p className="mb-0">
                  <strong>Order Number:</strong> {invoice.order.order_number}
                </p>
              )}
            </Col>
          </Row>

          <hr />

          <h5 className="mb-3">Invoice Items</h5>
          {invoice.items && invoice.items.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th className="text-end">Quantity</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_name}</td>
                      <td className="text-end">{item.quantity}</td>
                      <td className="text-end">{formatCurrency(item.price)}</td>
                      <td className="text-end">{formatCurrency(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3} className="text-end">Total:</th>
                    <th className="text-end">{formatCurrency(invoice.total_amount)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <Alert variant="info">No items attached to this invoice</Alert>
          )}

          {invoice.notes && (
            <>
              <h5 className="mt-4">Notes</h5>
              <p>{invoice.notes}</p>
            </>
          )}

          {invoice.receipts && invoice.receipts.length > 0 && (
            <>
              <h5 className="mt-4">Payments</h5>
              <ListGroup className="mb-3">
                {invoice.receipts.map((receipt) => (
                  <ListGroup.Item key={receipt.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Receipt #{receipt.receipt_number}</strong>
                      <p className="mb-0 text-muted">
                        {formatDate(receipt.created_at)} | {receipt.payment_method}
                      </p>
                    </div>
                    <div className="text-end">
                      <h5 className="mb-0">{formatCurrency(receipt.amount)}</h5>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InvoiceDetail; 