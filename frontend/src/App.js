import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Navigation';
import Home from './components/Home';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import ReportDetail from './components/ReportDetail';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './styles.css';

function App() {
  return (
    <Router>
      <Navigation />
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App; 