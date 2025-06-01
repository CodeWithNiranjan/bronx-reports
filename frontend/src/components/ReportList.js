import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ReportList = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [userLocation, setUserLocation] = useState(null);
    const [showNearby, setShowNearby] = useState(false);
    const [radius, setRadius] = useState(1); // Default 1km radius
    const [locationError, setLocationError] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            console.log('Fetching reports...');
            const response = await axios.get('http://localhost:5000/api/reports');
            console.log('Reports fetched:', response.data);
            setReports(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError('Failed to fetch reports. Please try again later.');
            setLoading(false);
        }
    };

    const getUserLocation = () => {
        setLocationError(null);
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                await fetchNearbyReports(latitude, longitude);
            },
            (error) => {
                console.error('Error getting location:', error);
                setLocationError('Unable to retrieve your location. Please check your location permissions.');
            }
        );
    };

    const fetchNearbyReports = async (latitude, longitude) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/reports/nearby`, {
                params: { latitude, longitude, radius }
            });
            setReports(response.data);
            setShowNearby(true);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching nearby reports:', err);
            setError('Failed to fetch nearby reports. Please try again later.');
            setLoading(false);
        }
    };

    const filterReports = () => {
        return reports.filter(report => {
            const matchesSearch = report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                report.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
            const matchesType = typeFilter === 'all' || report.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'open': return 'danger';
            case 'in_progress': return 'warning';
            case 'resolved': return 'success';
            default: return 'secondary';
        }
    };

    const getTypeBadgeVariant = (type) => {
        switch (type) {
            case 'pothole': return 'primary';
            case 'graffiti': return 'info';
            case 'streetlight': return 'warning';
            case 'garbage': return 'dark';
            default: return 'secondary';
        }
    };

    const formatDistance = (distance) => {
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m`;
        }
        return `${distance.toFixed(1)}km`;
    };

    const filteredReports = filterReports();

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading reports...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4">Reports</h2>
            
            {/* Search and Filter Controls */}
            <Row className="mb-4">
                <Col md={4}>
                    <Form.Control
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-2"
                    />
                </Col>
                <Col md={3}>
                    <Form.Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="mb-2"
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="mb-2"
                    >
                        <option value="all">All Types</option>
                        <option value="pothole">Pothole</option>
                        <option value="graffiti">Graffiti</option>
                        <option value="streetlight">Street Light</option>
                        <option value="garbage">Garbage</option>
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <Button 
                        variant="outline-primary" 
                        onClick={() => {
                            setShowNearby(false);
                            fetchReports();
                        }}
                        className="w-100 mb-2"
                    >
                        Show All
                    </Button>
                </Col>
            </Row>

            {/* Nearby Reports Controls */}
            <Row className="mb-4 g-3">
                <Col xs={12} md={6}>
                    <Button 
                        variant="primary" 
                        onClick={getUserLocation}
                        className="w-100 py-2"
                        style={{ minHeight: '38px' }}
                    >
                        <i className="bi bi-geo-alt me-2"></i>
                        {userLocation ? 'Refresh Nearby Reports' : 'Show Reports Near Me'}
                    </Button>
                </Col>
                <Col xs={12} md={6}>
                    <Form.Group className="h-100 d-flex flex-column justify-content-center">
                        <Form.Label className="mb-2">Search Radius: {radius}km</Form.Label>
                        <Form.Range
                            min="0.5"
                            max="5"
                            step="0.5"
                            value={radius}
                            onChange={(e) => {
                                setRadius(parseFloat(e.target.value));
                                if (userLocation) {
                                    fetchNearbyReports(userLocation.latitude, userLocation.longitude);
                                }
                            }}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {locationError && (
                <Alert variant="warning" className="mb-4">
                    {locationError}
                </Alert>
            )}

            {showNearby && userLocation && (
                <Alert variant="info" className="mb-4">
                    Showing reports within {radius}km of your location
                </Alert>
            )}

            {filteredReports.length === 0 ? (
                <Alert variant="info">
                    No reports found. {showNearby ? 'Try increasing the search radius.' : 'Try adjusting your filters.'}
                </Alert>
            ) : (
                <Row>
                    {filteredReports.map(report => (
                        <Col key={report.id} md={6} lg={4} className="mb-4">
                            <Card className="h-100 shadow-sm">
                                {report.image && (
                                    <Card.Img 
                                        variant="top" 
                                        src={`http://localhost:5000/uploads/${report.image}`}
                                        alt={report.description}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title className="d-flex justify-content-between align-items-start">
                                        <span>{report.location}</span>
                                        <Badge bg={getStatusBadgeVariant(report.status)} className="ms-2">
                                            {report.status.replace('_', ' ')}
                                        </Badge>
                                    </Card.Title>
                                    <Card.Text>{report.description}</Card.Text>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Badge bg={getTypeBadgeVariant(report.type)}>
                                            {report.type}
                                        </Badge>
                                        {report.distance && (
                                            <small className="text-muted">
                                                {formatDistance(report.distance)} away
                                            </small>
                                        )}
                                    </div>
                                </Card.Body>
                                <Card.Footer className="text-muted">
                                    Reported on {new Date(report.created_at).toLocaleDateString()}
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Map View */}
            <div className="mt-4" style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                <MapContainer 
                    center={userLocation ? [userLocation.latitude, userLocation.longitude] : [40.8448, -73.8648]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {userLocation && (
                        <Marker position={[userLocation.latitude, userLocation.longitude]}>
                            <Popup>
                                Your Location
                            </Popup>
                        </Marker>
                    )}
                    {filteredReports.map(report => (
                        <Marker 
                            key={report.id} 
                            position={[report.latitude, report.longitude]}
                        >
                            <Popup>
                                <div>
                                    <h6>{report.location}</h6>
                                    <p>{report.description}</p>
                                    <Badge bg={getStatusBadgeVariant(report.status)}>
                                        {report.status.replace('_', ' ')}
                                    </Badge>
                                    {report.distance && (
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                {formatDistance(report.distance)} away
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </Container>
    );
};

export default ReportList; 