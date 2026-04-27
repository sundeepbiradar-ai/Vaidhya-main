import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import api from '../api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      } catch (error) {
        window.location.href = '/login';
      }
    };
    
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/bookings/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data.bookings);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      }
    };
    
    fetchProfile();
    fetchBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (!user) return <Container className="py-5">Loading...</Container>;

  return (
    <Container className="py-5">
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h3>Dashboard</h3>
            </Card.Header>
            <Card.Body>
              <p>Welcome, {user.email}!</p>
              
              <h5>Your Bookings</h5>
              {bookings.length === 0 ? (
                <p>No bookings yet.</p>
              ) : (
                <ListGroup>
                  {bookings.map(booking => (
                    <ListGroup.Item key={booking.id}>
                      <strong>{booking.procedure}</strong> at Hospital #{booking.hospital_id}
                      <br />
                      <small>Date: {new Date(booking.booking_date).toLocaleDateString()}</small>
                      <br />
                      <small>Status: {booking.status}</small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
              
              <Button variant="primary" href="/search" className="mt-3">
                Find More Hospitals
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Button variant="outline-danger" onClick={handleLogout} className="w-100">
                Logout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;