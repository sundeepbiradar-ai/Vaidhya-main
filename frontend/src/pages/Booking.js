import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import api from '../api';

function Booking() {
  const { hospitalId } = useParams();
  const [hospital, setHospital] = useState(null);
  const [formData, setFormData] = useState({
    procedure: '',
    booking_date: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const response = await api.get(`/api/hospitals/${hospitalId}`);
        setHospital(response.data.hospital);
      } catch (error) {
        console.error('Failed to fetch hospital:', error);
      }
    };
    fetchHospital();
  }, [hospitalId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/bookings', {
        hospital_id: parseInt(hospitalId),
        ...formData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setError('');
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Please login to book an appointment.');
      } else {
        setError('Booking failed. Please try again.');
      }
    }
  };

  if (!hospital) return <Container className="py-5">Loading...</Container>;

  if (success) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="success">
              Booking successful! Check your dashboard for details.
            </Alert>
            <Button variant="primary" href="/dashboard">Go to Dashboard</Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h3>Book Appointment at {hospital.name}</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Procedure/Service</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Consultation, Surgery"
                    required
                    value={formData.procedure}
                    onChange={(e) => setFormData({...formData, procedure: e.target.value})}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Preferred Date</Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.booking_date}
                    onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Book Appointment
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Booking;