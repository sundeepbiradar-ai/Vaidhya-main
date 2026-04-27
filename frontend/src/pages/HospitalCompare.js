import React from 'react';
import { Container, Card, Button, Table } from 'react-bootstrap';

function HospitalCompare() {
  // Placeholder comparison data
  const comparisonData = [
    { name: 'City General Hospital', rating: 4.2, beds: 200, available: 45, city: 'Mumbai' },
    { name: 'Metro Medical Center', rating: 4.5, beds: 150, available: 30, city: 'Delhi' }
  ];

  return (
    <Container className="py-5">
      <h2>Compare Hospitals</h2>
      
      <Table striped bordered hover responsive className="mt-4">
        <thead>
          <tr>
            <th>Hospital</th>
            <th>City</th>
            <th>Rating</th>
            <th>Total Beds</th>
            <th>Available Beds</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {comparisonData.map((hospital, index) => (
            <tr key={index}>
              <td>{hospital.name}</td>
              <td>{hospital.city}</td>
              <td>{hospital.rating}/5</td>
              <td>{hospital.beds}</td>
              <td>{hospital.available}</td>
              <td>
                <Button variant="outline-primary" size="sm">
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default HospitalCompare;