import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, InputGroup, Modal, Dropdown } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaFilter, FaUserTie } from 'react-icons/fa';
import { leadService, contactService } from '../services/api';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState({
    contact_id: '',
    status: 'New',
    source: '',
    notes: '',
    estimated_value: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchContacts();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadService.getLeads();
      setLeads(response.data.leads || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads. Please try again later.');
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
    if (!selectedLead) return;
    
    try {
      await leadService.deleteLead(selectedLead.id);
      setLeads(leads.filter(lead => lead.id !== selectedLead.id));
      setShowDeleteModal(false);
      setSelectedLead(null);
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError('Failed to delete lead. Please try again.');
    }
  };

  const confirmDelete = (lead: any) => {
    setSelectedLead(lead);
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
    
    if (!formData.contact_id) {
      setError('Please select a contact');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        contact_id: parseInt(formData.contact_id),
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null
      };
      
      if (selectedLead) {
        await leadService.updateLead(selectedLead.id, payload);
      } else {
        await leadService.createLead(payload);
      }
      
      fetchLeads();
      setShowAddModal(false);
      
      // Reset form
      setFormData({
        contact_id: '',
        status: 'New',
        source: '',
        notes: '',
        estimated_value: ''
      });
      setSelectedLead(null);
    } catch (err) {
      console.error('Error saving lead:', err);
      setError('Failed to save lead. Please try again.');
    }
  };

  const handleEdit = (lead: any) => {
    setFormData({
      contact_id: lead.contact_id.toString(),
      status: lead.status,
      source: lead.source || '',
      notes: lead.notes || '',
      estimated_value: lead.estimated_value ? lead.estimated_value.toString() : ''
    });
    setSelectedLead(lead);
    setShowAddModal(true);
  };

  const updateLeadStatus = async (lead: any, newStatus: string) => {
    try {
      await leadService.updateLead(lead.id, { ...lead, status: newStatus });
      fetchLeads();
    } catch (err) {
      console.error('Error updating lead status:', err);
      setError('Failed to update lead status. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return <Badge bg="info">New</Badge>;
      case 'contacted':
        return <Badge bg="primary">Contacted</Badge>;
      case 'qualified':
        return <Badge bg="warning">Qualified</Badge>;
      case 'proposal':
        return <Badge bg="secondary">Proposal</Badge>;
      case 'negotiation':
        return <Badge bg="dark">Negotiation</Badge>;
      case 'won':
        return <Badge bg="success">Won</Badge>;
      case 'lost':
        return <Badge bg="danger">Lost</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container fluid>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="h3 mb-0">Leads</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={() => {
              setSelectedLead(null);
              setFormData({
                contact_id: '',
                status: 'New',
                source: '',
                notes: '',
                estimated_value: ''
              });
              setShowAddModal(true);
            }}
          >
            <FaPlus className="me-1" /> Add Lead
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col md={5}>
              <InputGroup>
                <Form.Control
                  placeholder="Search leads..."
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
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </Form.Select>
            </Col>
            <Col md={4} className="text-end">
              <span className="text-muted me-2">
                {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found
              </span>
              <Button variant="outline-secondary" size="sm" onClick={() => fetchLeads()}>
                <FaFilter className="me-1" /> Refresh
              </Button>
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
          ) : filteredLeads.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Value</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.contact_name}</td>
                      <td>{lead.source || '-'}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" id={`dropdown-status-${lead.id}`} className="p-0 text-decoration-none">
                            {getStatusBadge(lead.status)}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => updateLeadStatus(lead, 'New')}>New</Dropdown.Item>
                            <Dropdown.Item onClick={() => updateLeadStatus(lead, 'Contacted')}>Contacted</Dropdown.Item>
                            <Dropdown.Item onClick={() => updateLeadStatus(lead, 'Qualified')}>Qualified</Dropdown.Item>
                            <Dropdown.Item onClick={() => updateLeadStatus(lead, 'Proposal')}>Proposal</Dropdown.Item>
                            <Dropdown.Item onClick={() => updateLeadStatus(lead, 'Negotiation')}>Negotiation</Dropdown.Item>
                            <Dropdown.Item onClick={() => updateLeadStatus(lead, 'Won')}>Won</Dropdown.Item>
                            <Dropdown.Item onClick={() => updateLeadStatus(lead, 'Lost')}>Lost</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                      <td>{lead.estimated_value ? formatCurrency(lead.estimated_value) : '-'}</td>
                      <td>{formatDate(lead.created_at)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleEdit(lead)}
                            title="Edit Lead"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => confirmDelete(lead)}
                            title="Delete Lead"
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
                <FaUserTie size={64} className="text-muted" />
              </div>
              <h4>No leads found</h4>
              <p className="text-muted">You haven't added any leads yet or none match your current filters.</p>
              <Button 
                variant="primary" 
                className="mt-2"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchTerm('');
                  setShowAddModal(true);
                }}
              >
                <FaPlus className="me-1" /> Add Your First Lead
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Lead Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedLead ? 'Edit Lead' : 'Add New Lead'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {contacts.length === 0 ? (
            <div className="text-center p-3">
              <FaUserTie size={48} className="text-muted mb-3" />
              <h5>No Contacts Available</h5>
              <p className="text-muted">You need to create a contact before adding a lead.</p>
              <Button
                variant="primary"
                onClick={() => {
                  setShowAddModal(false);
                  window.location.href = '/contacts/new';
                }}
              >
                Create Contact
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Contact</Form.Label>
                <Form.Select 
                  name="contact_id" 
                  value={formData.contact_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a contact</option>
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
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Source</Form.Label>
                <Form.Control 
                  type="text" 
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  placeholder="Where did this lead come from?"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Estimated Value</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control 
                    type="number" 
                    name="estimated_value"
                    value={formData.estimated_value}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Additional notes about this lead"
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {selectedLead ? 'Update Lead' : 'Add Lead'}
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
          Are you sure you want to delete the lead for <strong>{selectedLead?.contact_name}</strong>? This action cannot be undone.
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

export default Leads;
