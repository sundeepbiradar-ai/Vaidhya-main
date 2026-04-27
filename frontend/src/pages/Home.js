import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function Home() {
  return (
    <Container className="py-5">
      <Row className="text-center mb-5">
        <Col>
          <h1>Welcome to Hospital Compare</h1>
          <p className="lead">Find, compare, and book the best healthcare services</p>
          <Button variant="primary" size="lg" href="/search">
            Start Searching
          </Button>
        </Col>
      </Row>
      
      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Search Hospitals</Card.Title>
              <Card.Text>
                Find hospitals by location, specialty, and services
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Compare Options</Card.Title>
              <Card.Text>
                Compare costs, facilities, and doctor experience
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Book Appointments</Card.Title>
              <Card.Text>
                Secure booking with easy online reservation
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;