import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { contactService } from '../services/api';
import { Contact } from '../types';

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const response = await contactService.getContacts();
        setContacts(response.data.contacts);
        setError(null);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to load contacts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactService.deleteContact(id);
        setContacts(contacts.filter(contact => contact.id !== id));
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError('Failed to delete contact. Please try again later.');
      }
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

  return (
    <Container>
      <div className="page-header">
        <h1 className="page-title">Contacts</h1>
        <Link to="/contacts/new">
          <Button variant="primary">+ Add Contact</Button>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col>
              <InputGroup>
                <Form.Control
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Col>
          </Row>

          {filteredContacts.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(contact => (
                  <tr key={contact.id}>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.company}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link to={`/contacts/${contact.id}`}>
                          <Button size="sm" variant="info">View</Button>
                        </Link>
                        <Link to={`/contacts/${contact.id}/edit`}>
                          <Button size="sm" variant="secondary">Edit</Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          onClick={() => handleDelete(contact.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center p-3">
              {searchTerm ? 'No contacts matching your search.' : 'No contacts found. Add a contact to get started.'}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Contacts; 