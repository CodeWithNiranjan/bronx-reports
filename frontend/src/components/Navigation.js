import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary">
          Bronx360
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`px-3 ${isActive('/') ? 'text-primary' : 'text-dark'}`}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/report" 
              className={`px-3 ${isActive('/report') ? 'text-primary' : 'text-dark'}`}
            >
              Report Issue
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/reports" 
              className={`px-3 ${isActive('/reports') ? 'text-primary' : 'text-dark'}`}
            >
              View Reports
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/admin/login" 
              className={`px-3 ${isActive('/admin') || isActive('/admin/login') ? 'text-primary' : 'text-dark'}`}
            >
              Admin
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation; 