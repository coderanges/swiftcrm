import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Badge, Tab, Nav, Alert, Modal } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contactService } from '../services/api';
import { Contact } from '../types';

const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        const response = await contactService.getContact(Number(id));
        setContact(response.data.contact);
        setError(null);
      } catch (err) {
        console.error('Error fetching contact:', err);
        setError('Failed to load contact details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContact();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await contactService.deleteContact(Number(id));
      navigate('/contacts', { state: { message: 'Contact deleted successfully!' } });
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact. Please try again later.');
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/contacts')}>
          Back to Contacts
        </Button>
      </Container>
    );
  }

  if (!contact) {
    return (
      <Container>
        <Alert variant="warning">Contact not found</Alert>
        <Button variant="primary" onClick={() => navigate('/contacts')}>
          Back to Contacts
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="page-header d-flex justify-content-between align-items-center">
        <h1 className="page-title">Contact Details</h1>
        <div>
          <Link to={`/contacts/${id}/edit`}>
            <Button variant="secondary" className="me-2">Edit</Button>
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <h3>{contact.name}</h3>
              {contact.company && <p className="text-muted mb-3">{contact.company}</p>}

              <div className="mb-3">
                {contact.email && (
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  </p>
                )}
                {contact.phone && (
                  <p>
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                  </p>
                )}
                {contact.address && (
                  <p>
                    <strong>Address:</strong> {contact.address}
                  </p>
                )}
              </div>
            </Col>
            <Col md={6}>
              <Card className="bg-light">
                <Card.Body>
                  <h5>Details</h5>
                  <p>
                    <strong>Created:</strong>{' '}
                    {new Date(contact.created_at).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{' '}
                    {new Date(contact.updated_at).toLocaleDateString()}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {contact.notes && (
            <div className="mt-4">
              <h5>Notes</h5>
              <Card>
                <Card.Body>
                  <p className="mb-0">{contact.notes}</p>
                </Card.Body>
              </Card>
            </div>
          )}

          {/* Related Data Tabs */}
          <div className="mt-4">
            <h5>Related Information</h5>
            <Tab.Container defaultActiveKey="leads">
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="leads">Leads</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="orders">Orders</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="invoices">Invoices</Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content className="p-3 border border-top-0">
                <Tab.Pane eventKey="leads">
                  <p className="text-muted">No leads associated with this contact.</p>
                </Tab.Pane>
                <Tab.Pane eventKey="orders">
                  <p className="text-muted">No orders associated with this contact.</p>
                </Tab.Pane>
                <Tab.Pane eventKey="invoices">
                  <p className="text-muted">No invoices associated with this contact.</p>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </Card.Body>
        <Card.Footer>
          <Button variant="outline-secondary" onClick={() => navigate('/contacts')}>
            Back to Contacts
          </Button>
        </Card.Footer>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {contact.name}? This action cannot be undone.
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

export default ContactDetail; 