import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaPlus, FaEye, FaEdit, FaTrash, FaTimes, FaReceipt, FaFileInvoiceDollar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { receiptService, invoiceService } from '../services/api';

const Receipts: React.FC = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'Credit Card',
    notes: '',
    invoice_id: ''
  });

  useEffect(() => {
    fetchReceipts();
    fetchInvoices();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptService.getReceipts();
      setReceipts(response.data.receipts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Failed to load receipts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await invoiceService.getInvoices();
      // Filter to show only unpaid or partially paid invoices
      const unpaidInvoices = (response.data.invoices || []).filter(
        (invoice: any) => invoice.status === 'Unpaid' || invoice.status === 'Partial'
      );
      setInvoices(unpaidInvoices);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedReceipt) return;
    
    try {
      await receiptService.deleteReceipt(selectedReceipt.id);
      setReceipts(receipts.filter(receipt => receipt.id !== selectedReceipt.id));
      setShowDeleteModal(false);
      setSelectedReceipt(null);
      // Refresh invoices as their status might have changed
      fetchInvoices();
    } catch (err) {
      console.error('Error deleting receipt:', err);
      setError('Failed to delete receipt. Please try again.');
    }
  };

  const confirmDelete = (receipt: any) => {
    setSelectedReceipt(receipt);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.invoice_id) {
      setError('Please select an invoice');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        invoice_id: parseInt(formData.invoice_id)
      };
      
      await receiptService.createReceipt(payload);
      fetchReceipts();
      fetchInvoices();
      setShowAddModal(false);
      
      // Reset form
      setFormData({
        amount: '',
        payment_method: 'Credit Card',
        notes: '',
        invoice_id: ''
      });
    } catch (err) {
      console.error('Error creating receipt:', err);
      setError('Failed to create receipt. Please try again.');
    }
  };

  const filteredReceipts = receipts.filter(receipt => 
    receipt.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.invoice?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="h3 mb-0">Receipts</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus className="me-1" /> Record Payment
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="mb-0">Payment Receipts</h5>
            </Col>
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  placeholder="Search receipts..."
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
          ) : filteredReceipts.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Invoice #</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.id}>
                      <td>{receipt.receipt_number}</td>
                      <td>
                        <a href={`/invoices/${receipt.invoice_id}`}>
                          {receipt.invoice?.invoice_number || 'N/A'}
                        </a>
                      </td>
                      <td>{formatCurrency(receipt.amount)}</td>
                      <td>{receipt.payment_method}</td>
                      <td>{formatDate(receipt.created_at)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => navigate(`/invoices/${receipt.invoice_id}`)}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => confirmDelete(receipt)}
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
                <FaReceipt size={64} className="text-muted" />
              </div>
              <h4>No receipts found</h4>
              <p className="text-muted">You haven't recorded any payments yet. Get started by recording your first payment.</p>
              <Button 
                variant="primary" 
                className="mt-2"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="me-1" /> Record Your First Payment
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Receipt Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Record Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {invoices.length === 0 ? (
            <div className="text-center p-3">
              <FaFileInvoiceDollar size={48} className="text-muted mb-3" />
              <h5>No Unpaid Invoices</h5>
              <p className="text-muted">There are no unpaid invoices to apply payments to.</p>
              <Button
                variant="primary"
                onClick={() => {
                  setShowAddModal(false);
                  navigate('/invoices/new');
                }}
              >
                Create Invoice
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Select Invoice</Form.Label>
                <Form.Select 
                  name="invoice_id" 
                  value={formData.invoice_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select an invoice</option>
                  {invoices.map(invoice => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} - {invoice.contact_name} ({formatCurrency(invoice.total_amount)})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control 
                    type="number" 
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select 
                  name="payment_method" 
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Optional notes about this payment"
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Record Payment
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete receipt <strong>{selectedReceipt?.receipt_number}</strong> for {formatCurrency(selectedReceipt?.amount || 0)}? 
          This action cannot be undone and may affect the status of the associated invoice.
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

export default Receipts; 