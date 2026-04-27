import React from 'react';
import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-light mt-5 py-4">
      <Container>
        <p className="text-center text-muted">
          © 2024 Hospital Comparison Platform. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

export default Footer;