import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import api from '../api';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [userExists, setUserExists] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);

  const handleEmailBlur = async () => {
    const email = formData.email.trim();
    if (!email) {
      setUserExists(null);
      return;
    }

    try {
      setCheckingUser(true);
      const response = await api.post('/api/auth/check-user', { email });
      setUserExists(response.data.exists);
    } catch (error) {
      setUserExists(null);
    } finally {
      setCheckingUser(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard';
    } catch (error) {
      if (error.response?.status === 400 && userExists === false) {
        setError('No account found. Please register now.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h3>Login</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {userExists === false && !error && (
                <Alert variant="warning">
                  No user found with that email. <a href="/register">Register now</a>.
                </Alert>
              )}
              {userExists === true && (
                <Alert variant="info">User found. Please enter your password.</Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={handleEmailBlur}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </Form.Group>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <a href="/forgot-password">Forgot Password?</a>
                  {checkingUser && <Spinner animation="border" size="sm" />}
                </div>
                <Button variant="primary" type="submit" className="w-100">
                  Login
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;