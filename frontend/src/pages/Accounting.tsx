import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal, Tabs, Tab, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaChartPie, FaFilter, FaFileInvoiceDollar, FaReceipt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { accountingService } from '../services/api';
import { AccountingEntry } from '../types';
import Chart from 'chart.js/auto';

const Accounting: React.FC = () => {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AccountingEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [activePeriod, setActivePeriod] = useState('month');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger');
  
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    entry_type: 'Income',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEntries();
    fetchSummary('month');
  }, []);

  useEffect(() => {
    if (summaryData) {
      renderCharts();
    }
  }, [summaryData]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      console.log('Fetching accounting entries...');
      const response = await accountingService.getEntries();
      console.log('Entries response:', response.data);
      setEntries(response.data.entries || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching accounting entries:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      setError('Failed to load accounting data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (period: string) => {
    try {
      setSummaryLoading(true);
      console.log(`Fetching summary for period: ${period}`);
      const response = await accountingService.getSummary(period);
      console.log('Summary response:', response.data);
      setSummaryData(response.data);
      setActivePeriod(period);
    } catch (err: any) {
      console.error('Error fetching summary:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
    } finally {
      setSummaryLoading(false);
    }
  };

  const renderCharts = () => {
    if (!summaryData) return;

    // Destroy existing charts to prevent duplicates
    const existingChartIncome = Chart.getChart('incomeChart');
    if (existingChartIncome) existingChartIncome.destroy();

    const existingChartExpense = Chart.getChart('expenseChart');
    if (existingChartExpense) existingChartExpense.destroy();

    // Income chart
    if (summaryData.income_by_category && document.getElementById('incomeChart')) {
      const incomeCategories = Object.keys(summaryData.income_by_category);
      const incomeValues = Object.values(summaryData.income_by_category);

      new Chart(
        document.getElementById('incomeChart') as HTMLCanvasElement,
        {
          type: 'pie',
          data: {
            labels: incomeCategories,
            datasets: [
              {
                data: incomeValues,
                backgroundColor: [
                  '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107',
                  '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'
                ]
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right'
              },
              title: {
                display: true,
                text: 'Income by Category'
              }
            }
          }
        }
      );
    }

    // Expense chart
    if (summaryData.expenses_by_category && document.getElementById('expenseChart')) {
      const expenseCategories = Object.keys(summaryData.expenses_by_category);
      const expenseValues = Object.values(summaryData.expenses_by_category);

      new Chart(
        document.getElementById('expenseChart') as HTMLCanvasElement,
        {
          type: 'pie',
          data: {
            labels: expenseCategories,
            datasets: [
              {
                data: expenseValues,
                backgroundColor: [
                  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
                  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'
                ]
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right'
              },
              title: {
                display: true,
                text: 'Expenses by Category'
              }
            }
          }
        }
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    
    try {
      await accountingService.deleteEntry(selectedEntry.id);
      setEntries(entries.filter(entry => entry.id !== selectedEntry.id));
      setShowDeleteModal(false);
      setSelectedEntry(null);
      
      // Refresh summary data
      fetchSummary(activePeriod);
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete entry. Please try again.');
    }
  };

  const confirmDelete = (entry: AccountingEntry) => {
    setSelectedEntry(entry);
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
    
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      await accountingService.createEntry(payload);
      fetchEntries();
      fetchSummary(activePeriod);
      setShowAddModal(false);
      
      // Reset form
      setFormData({
        entry_type: 'Income',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error creating entry:', err);
      setError('Failed to create entry. Please try again.');
    }
  };

  const getEntryTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'income':
        return <Badge bg="success">Income</Badge>;
      case 'expense':
        return <Badge bg="danger">Expense</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };

  const filteredEntries = entries.filter(entry => 
    entry.entry_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="h3">Accounting</h1>
          <p className="text-muted">Manage your financial transactions, income, and expenses</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add Entry
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading accounting data...</p>
        </div>
      ) : (
        <Tabs
          id="accounting-tabs"
          activeKey={activeTab}
          onSelect={(k) => k && setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="ledger" title="General Ledger">
            <Card>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <InputGroup>
                      <Form.Control
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                          <FaTimes />
                        </Button>
                      )}
                    </InputGroup>
                  </Col>
                </Row>

                {entries.length === 0 ? (
                  <Alert variant="info">
                    No accounting entries found. Use the "Add Entry" button to create your first financial record.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Category</th>
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEntries.map((entry) => (
                          <tr key={entry.id}>
                            <td>{getEntryTypeBadge(entry.entry_type)}</td>
                            <td>{entry.category}</td>
                            <td>{entry.description}</td>
                            <td className={entry.entry_type.toLowerCase() === 'income' ? 'text-success' : 'text-danger'}>
                              {formatCurrency(entry.amount)}
                            </td>
                            <td>{formatDate(entry.date)}</td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setFormData({
                                      entry_type: entry.entry_type,
                                      category: entry.category,
                                      amount: entry.amount.toString(),
                                      description: entry.description || '',
                                      date: new Date(entry.date).toISOString().split('T')[0]
                                    });
                                    setSelectedEntry(entry);
                                    setShowAddModal(true);
                                  }}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => confirmDelete(entry)}
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
                )}
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="summary" title="Financial Summary">
            <Card>
              <Card.Header>
                <Row className="align-items-center">
                  <Col md={6}>
                    <h5 className="mb-0">Financial Summary</h5>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex justify-content-md-end">
                      <Button
                        variant={activePeriod === 'week' ? 'primary' : 'outline-primary'}
                        size="sm"
                        className="me-2"
                        onClick={() => fetchSummary('week')}
                      >
                        Week
                      </Button>
                      <Button
                        variant={activePeriod === 'month' ? 'primary' : 'outline-primary'}
                        size="sm"
                        className="me-2"
                        onClick={() => fetchSummary('month')}
                      >
                        Month
                      </Button>
                      <Button
                        variant={activePeriod === 'quarter' ? 'primary' : 'outline-primary'}
                        size="sm"
                        className="me-2"
                        onClick={() => fetchSummary('quarter')}
                      >
                        Quarter
                      </Button>
                      <Button
                        variant={activePeriod === 'year' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => fetchSummary('year')}
                      >
                        Year
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                {summaryLoading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading summary...</span>
                    </div>
                  </div>
                ) : summaryData ? (
                  <>
                    <Row className="mb-4">
                      <Col md={4}>
                        <Card className="text-center h-100">
                          <Card.Body className="d-flex flex-column justify-content-center">
                            <h6 className="text-muted">Total Income</h6>
                            <h3 className="text-success">
                              {formatCurrency(summaryData.total_income || 0)}
                            </h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center h-100">
                          <Card.Body className="d-flex flex-column justify-content-center">
                            <h6 className="text-muted">Total Expenses</h6>
                            <h3 className="text-danger">
                              {formatCurrency(summaryData.total_expenses || 0)}
                            </h3>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={4}>
                        <Card className="text-center h-100">
                          <Card.Body className="d-flex flex-column justify-content-center">
                            <h6 className="text-muted">Net Profit</h6>
                            <h3 className={summaryData.net_profit >= 0 ? 'text-success' : 'text-danger'}>
                              {formatCurrency(summaryData.net_profit || 0)}
                            </h3>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Card>
                          <Card.Header>Income by Category</Card.Header>
                          <Card.Body>
                            <canvas id="incomeChart"></canvas>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card>
                          <Card.Header>Expenses by Category</Card.Header>
                          <Card.Body>
                            <canvas id="expenseChart"></canvas>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </>
                ) : (
                  <Alert variant="info">No financial data available for the selected period.</Alert>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      )}

      {/* Add/Edit Entry Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedEntry ? 'Edit Entry' : 'Add New Entry'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Entry Type</Form.Label>
              <Form.Select 
                name="entry_type" 
                value={formData.entry_type}
                onChange={handleInputChange}
                required
              >
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control 
                type="text" 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                placeholder="e.g., Sales, Salary, Rent, Utilities"
              />
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
              <Form.Label>Date</Form.Label>
              <Form.Control 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Optional description"
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {selectedEntry ? 'Update Entry' : 'Add Entry'}
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
          Are you sure you want to delete this {selectedEntry?.entry_type.toLowerCase()} entry for {formatCurrency(selectedEntry?.amount || 0)}? This action cannot be undone.
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

export default Accounting; 