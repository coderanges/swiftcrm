import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { contactService, leadService, orderService, invoiceService } from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    contacts: 0,
    leads: 0,
    orders: 0,
    invoices: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch counts
        const [contactsRes, leadsRes, ordersRes, invoicesRes] = await Promise.all([
          contactService.getContacts(),
          leadService.getLeads(),
          orderService.getOrders(),
          invoiceService.getInvoices()
        ]);

        setStats({
          contacts: contactsRes.data.contacts.length,
          leads: leadsRes.data.leads.length,
          orders: ordersRes.data.orders.length,
          invoices: invoicesRes.data.invoices.length
        });

        // Create recent activity from various sources
        const activity = [
          ...contactsRes.data.contacts.slice(0, 3).map((c: any) => ({
            type: 'Contact',
            id: c.id,
            name: c.name,
            date: new Date(c.created_at).toLocaleDateString(),
            action: 'Added',
            link: `/contacts/${c.id}`
          })),
          ...leadsRes.data.leads.slice(0, 3).map((l: any) => ({
            type: 'Lead',
            id: l.id,
            name: l.name,
            date: new Date(l.created_at).toLocaleDateString(),
            action: 'Created',
            link: `/leads/${l.id}`
          })),
          ...ordersRes.data.orders.slice(0, 3).map((o: any) => ({
            type: 'Order',
            id: o.id,
            name: `Order #${o.id}`,
            date: new Date(o.created_at).toLocaleDateString(),
            action: 'Placed',
            link: `/orders/${o.id}`
          })),
          ...invoicesRes.data.invoices.slice(0, 3).map((i: any) => ({
            type: 'Invoice',
            id: i.id,
            name: `Invoice #${i.id}`,
            date: new Date(i.created_at).toLocaleDateString(),
            action: 'Generated',
            link: `/invoices/${i.id}`
          }))
        ];

        // Sort by date (newest first) and take first 10
        activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentActivity(activity.slice(0, 10));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card bg-primary text-white">
            <Card.Body>
              <Card.Title>CONTACTS</Card.Title>
              <div className="stat-value">{stats.contacts}</div>
              <Link to="/contacts" className="text-white">
                View all contacts
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card bg-success text-white">
            <Card.Body>
              <Card.Title>LEADS</Card.Title>
              <div className="stat-value">{stats.leads}</div>
              <Link to="/leads" className="text-white">
                View all leads
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card bg-info text-white">
            <Card.Body>
              <Card.Title>ORDERS</Card.Title>
              <div className="stat-value">{stats.orders}</div>
              <Link to="/orders" className="text-white">
                View all orders
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="stat-card bg-warning text-white">
            <Card.Body>
              <Card.Title>INVOICES</Card.Title>
              <div className="stat-value">{stats.invoices}</div>
              <Link to="/invoices" className="text-white">
                View all invoices
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>Recent Activity</Card.Header>
            <Card.Body>
              {recentActivity.length > 0 ? (
                <Table striped responsive>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Action</th>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity, index) => (
                      <tr key={`${activity.type}-${activity.id}-${index}`}>
                        <td>{activity.type}</td>
                        <td>{activity.action}</td>
                        <td>{activity.name}</td>
                        <td>{activity.date}</td>
                        <td>
                          <Link to={activity.link}>
                            <Button size="sm" variant="primary">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">No recent activity found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Add Section */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>Quick Add</Card.Header>
            <Card.Body className="d-flex flex-wrap gap-2">
              <Link to="/contacts/new">
                <Button variant="outline-primary">+ Contact</Button>
              </Link>
              <Link to="/leads/new">
                <Button variant="outline-success">+ Lead</Button>
              </Link>
              <Link to="/orders/new">
                <Button variant="outline-info">+ Order</Button>
              </Link>
              <Link to="/invoices/new">
                <Button variant="outline-warning">+ Invoice</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 