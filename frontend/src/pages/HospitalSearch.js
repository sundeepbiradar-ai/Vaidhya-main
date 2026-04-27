import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import api from '../api';

function HospitalSearch() {
  const [hospitals, setHospitals] = useState([]);
  const [searchParams, setSearchParams] = useState({
    city: '',
    q: ''
  });

  const handleSearch = async () => {
    try {
      const response = await api.get('/api/hospitals/search', {
        params: searchParams
      });
      setHospitals(response.data.results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await api.get('/api/hospitals/search', {
          params: searchParams
        });
        setHospitals(response.data.results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    };

    fetchHospitals();
  }, [searchParams]);

  return (
    <Container className="py-5">
      <h2>Find Hospitals</h2>
      
      <Form className="mb-4">
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter city"
                value={searchParams.city}
                onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="Hospital name or specialty"
                value={searchParams.q}
                onChange={(e) => setSearchParams({...searchParams, q: e.target.value})}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" onClick={handleSearch} className="mt-3">
          Search
        </Button>
      </Form>

      <Row>
        {hospitals.map(hospital => (
          <Col md={6} lg={4} key={hospital.hospital_id} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{hospital.hospital_name}</Card.Title>
                <Card.Text>{hospital.address}</Card.Text>
                <Card.Text>Rating: {hospital.rating}/5</Card.Text>
                <Card.Text>City: {hospital.city}</Card.Text>
                <Button variant="outline-primary" href={`/hospital/${hospital.hospital_id}`}>
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default HospitalSearch;