import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchReports();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reports');
      setReports(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching reports');
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/reports/${reportId}`, {
        status: newStatus,
        username: 'admin',
        password: 'admin123'
      });
      // Update local state
      setReports(reports.map(report =>
        report.id === reportId
          ? { ...report, status: newStatus }
          : report
      ));
    } catch (err) {
      setError('Error updating report status');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      in_progress: 'info',
      resolved: 'success',
      rejected: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'} className="rounded-pill px-3 py-2">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4">
        {error}
      </Alert>
    );
  }

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-light mb-0">Admin Dashboard</h2>
        <Button 
          variant="outline-danger" 
          onClick={handleLogout}
          className="rounded-pill px-4"
        >
          Logout
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0">ID</th>
                  <th className="border-0">Type</th>
                  <th className="border-0">Description</th>
                  <th className="border-0">Status</th>
                  <th className="border-0">Date</th>
                  <th className="border-0">Update Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="align-middle">{report.id}</td>
                    <td className="align-middle">{report.issue_type}</td>
                    <td className="align-middle">{report.description.substring(0, 100)}...</td>
                    <td className="align-middle">{getStatusBadge(report.status)}</td>
                    <td className="align-middle">{new Date(report.created_at).toLocaleDateString()}</td>
                    <td className="align-middle">
                      <Form.Select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        size="sm"
                        className="border-0 bg-light rounded-pill"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </Form.Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AdminPanel; 