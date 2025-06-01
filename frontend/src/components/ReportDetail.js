import React, { useState, useEffect } from 'react';
import { Card, Badge, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';

function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reports/${id}`);
      setReport(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching report details');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      in_progress: 'info',
      resolved: 'success',
      rejected: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!report) {
    return <div className="alert alert-warning">Report not found</div>;
  }

  return (
    <div>
      <h2>Report Details</h2>
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3>Report #{report.id}</h3>
              <p className="text-muted">
                Submitted on {new Date(report.created_at).toLocaleString()}
              </p>
            </div>
            {getStatusBadge(report.status)}
          </div>

          <Card.Text>
            <strong>Issue Type:</strong> {report.issue_type}
          </Card.Text>
          <Card.Text>
            <strong>Description:</strong> {report.description}
          </Card.Text>

          {report.photo_path && (
            <div className="mb-3">
              <strong>Photo:</strong>
              <div className="mt-2">
                <img
                  src={`http://localhost:5000${report.photo_path}`}
                  alt="Report"
                  style={{ maxWidth: '100%', maxHeight: '300px' }}
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <strong>Location:</strong>
            <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
              <MapContainer
                center={[report.latitude, report.longitude]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[report.latitude, report.longitude]} />
              </MapContainer>
            </div>
          </div>

          <Card.Text>
            <strong>Last Updated:</strong>{' '}
            {new Date(report.updated_at).toLocaleString()}
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ReportDetail; 