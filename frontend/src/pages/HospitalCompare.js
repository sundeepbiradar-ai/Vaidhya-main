import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Table, Form, Row, Col } from 'react-bootstrap';
import api from '../api';

function HospitalCompare() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitals, setSelectedHospitals] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await api.get('/api/hospitals');
        setHospitals(response.data.hospitals);
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
      }
    };
    fetchHospitals();
  }, []);

  const handleCompare = async () => {
    if (selectedHospitals.length < 2) {
      alert('Please select at least 2 hospitals to compare');
      return;
    }

    try {
      const response = await api.post('/api/hospitals/compare', {
        hospitalIds: selectedHospitals
      });
      setComparisonData(response.data.comparison);
    } catch (error) {
      console.error('Failed to compare hospitals:', error);
    }
  };

  const toggleHospitalSelection = (hospitalId) => {
    setSelectedHospitals(prev =>
      prev.includes(hospitalId)
        ? prev.filter(id => id !== hospitalId)
        : [...prev, hospitalId]
    );
  };

  return (
    <Container className="py-5">
      <h2>Compare Hospitals</h2>

      <Card className="mb-4">
        <Card.Body>
          <h5>Select Hospitals to Compare</h5>
          <Row>
            {hospitals.map(hospital => (
              <Col md={4} key={hospital.hospital_id} className="mb-3">
                <Form.Check
                  type="checkbox"
                  label={`${hospital.hospital_name} (${hospital.city})`}
                  checked={selectedHospitals.includes(hospital.hospital_id)}
                  onChange={() => toggleHospitalSelection(hospital.hospital_id)}
                />
              </Col>
            ))}
          </Row>
          <Button variant="primary" onClick={handleCompare} disabled={selectedHospitals.length < 2}>
            Compare Selected Hospitals
          </Button>
        </Card.Body>
      </Card>

      {comparisonData.length > 0 && (
        <Table striped bordered hover responsive className="mt-4">
          <thead>
            <tr>
              <th>Hospital</th>
              <th>City</th>
              <th>Rating</th>
              <th>Facilities</th>
              <th>Beds</th>
              <th>Doctors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((hospital, index) => (
              <tr key={index}>
                <td>{hospital.hospital_name}</td>
                <td>{hospital.city}</td>
                <td>{hospital.rating}/5</td>
                <td>{hospital.facilities?.length || 0} facilities</td>
                <td>{hospital.beds?.reduce((sum, bed) => sum + bed.total_beds, 0) || 0} total beds</td>
                <td>{hospital.doctors?.length || 0} doctors</td>
                <td>
                  <Button variant="outline-primary" size="sm" href={`/hospital/${hospital.hospital_id}`}>
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default HospitalCompare;