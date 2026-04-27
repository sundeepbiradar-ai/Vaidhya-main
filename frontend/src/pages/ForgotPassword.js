import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import api from '../api';

function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await api.post('/api/auth/forgot-password', {
        email: formData.email,
        newPassword: formData.newPassword
      });
      setSuccess(response.data.message || 'Your password has been updated. Please log in.');
      setError('');
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Unable to reset password. Please try again.';
      if (error.response?.status === 404) {
        setError('No account found with that email. Please register now.');
      } else {
        setError(message);
      }
      console.error('Forgot password error:', error.response?.data || error.message || error);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h3>Forgot Password</h3>
            </Card.Header>
            <Card.Body>
              {success && <Alert variant="success">{success} <a href="/login">Login</a></Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              {!success && (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      required
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    Reset Password
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPassword;
