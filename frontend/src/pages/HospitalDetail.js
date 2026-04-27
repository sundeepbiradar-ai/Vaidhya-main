import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import api from '../api';

function HospitalDetail() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const response = await api.get(`/api/hospitals/${id}`);
        setHospital(response.data.hospital);
      } catch (error) {
        console.error('Failed to fetch hospital:', error);
      }
    };
    fetchHospital();
  }, [id]);

  if (!hospital) return <Container className="py-5">Loading...</Container>;

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>{hospital.name}</Card.Title>
              <Card.Text>{hospital.address}</Card.Text>
              <Card.Text>{hospital.contact_number}</Card.Text>
              <Badge bg="success" className="me-2">Rating: {hospital.rating}/5</Badge>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Departments</Card.Header>
            <Card.Body>
              {hospital.departments?.map((dept, index) => (
                <Badge key={index} bg="secondary" className="me-2 mb-2">{dept}</Badge>
              ))}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>Bed Availability</Card.Header>
            <Card.Body>
              <p>Total Beds: {hospital.bed_availability?.total}</p>
              <p>Available: {hospital.bed_availability?.available}</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card>
            <Card.Body>
              <Button variant="primary" className="w-100 mb-2" href={`/booking/${hospital.id}`}>
                Book Appointment
              </Button>
              <Button variant="outline-primary" className="w-100">
                Add to Compare
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default HospitalDetail;