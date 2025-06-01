import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/home.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for user location
const userLocationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to handle map updates
function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const Home = () => {
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([40.8448, -73.8648]);
    const [mapZoom, setMapZoom] = useState(12);
    const [locationError, setLocationError] = useState(null);

    const getUserLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }

        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);
                setMapCenter([latitude, longitude]);
                setMapZoom(15);
            },
            (error) => {
                setLocationError('Unable to retrieve your location');
                console.error('Error getting location:', error);
            }
        );
    };

    const handleReportNearMe = () => {
        if (userLocation) {
            // Navigate to report form with location pre-filled
            navigate('/report', { 
                state: { 
                    latitude: userLocation[0], 
                    longitude: userLocation[1] 
                } 
            });
        } else {
            getUserLocation();
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <div className="hero-section py-5 bg-primary text-white">
                <Container>
                    <Row className="align-items-center min-vh-75">
                        <Col lg={6} className="mb-4 mb-lg-0">
                            <h1 className="display-4 fw-bold mb-4">Make Your Bronx Better</h1>
                            <p className="lead mb-4">
                                Report local issues, track their progress, and help improve your neighborhood.
                                Together, we can make the Bronx a better place to live.
                            </p>
                            <div className="d-flex gap-3">
                                <Link to="/report">
                                    <Button variant="light" size="lg" className="px-4">
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Report an Issue
                                    </Button>
                                </Link>
                                <Button 
                                    variant="outline-light" 
                                    size="lg" 
                                    className="px-4"
                                    onClick={handleReportNearMe}
                                >
                                    <i className="bi bi-geo-alt me-2"></i>
                                    Report Near Me
                                </Button>
                            </div>
                            {locationError && (
                                <div className="text-warning mt-2">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {locationError}
                                </div>
                            )}
                        </Col>
                        <Col lg={6}>
                            <div className="map-container rounded-4 overflow-hidden shadow-lg" style={{ height: '400px' }}>
                                <MapContainer 
                                    center={mapCenter} 
                                    zoom={mapZoom} 
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    {userLocation && (
                                        <Marker 
                                            position={userLocation}
                                            icon={userLocationIcon}
                                        >
                                            <Popup>
                                                Your Location
                                            </Popup>
                                        </Marker>
                                    )}
                                    <MapUpdater center={mapCenter} zoom={mapZoom} />
                                </MapContainer>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Features Section */}
            <Container className="py-5">
                <h2 className="text-center mb-5">How It Works</h2>
                <Row className="g-4">
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm hover-card">
                            <Card.Body className="text-center p-4">
                                <div className="feature-icon mb-3">
                                    <i className="bi bi-geo-alt text-primary" style={{ fontSize: '2.5rem' }}></i>
                                </div>
                                <h3 className="h5 mb-3">Report Issues</h3>
                                <p className="text-muted mb-0">
                                    Easily report local issues like potholes, graffiti, or street light problems.
                                    Add photos and precise location details.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm hover-card">
                            <Card.Body className="text-center p-4">
                                <div className="feature-icon mb-3">
                                    <i className="bi bi-clock-history text-primary" style={{ fontSize: '2.5rem' }}></i>
                                </div>
                                <h3 className="h5 mb-3">Track Progress</h3>
                                <p className="text-muted mb-0">
                                    Monitor the status of reported issues in real-time.
                                    Get updates when problems are resolved.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm hover-card">
                            <Card.Body className="text-center p-4">
                                <div className="feature-icon mb-3">
                                    <i className="bi bi-people text-primary" style={{ fontSize: '2.5rem' }}></i>
                                </div>
                                <h3 className="h5 mb-3">Community Impact</h3>
                                <p className="text-muted mb-0">
                                    Join a community of active citizens working together
                                    to improve the Bronx neighborhood by neighborhood.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* CTA Section */}
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8} className="text-center">
                        <h2 className="mb-4">Ready to Make a Difference?</h2>
                        <p className="lead text-muted mb-4">
                            Join our community of active citizens and help make the Bronx a better place to live.
                            Your reports make a real difference.
                        </p>
                        <Link to="/report">
                            <Button variant="primary" size="lg" className="px-5">
                                <i className="bi bi-plus-circle me-2"></i>
                                Report an Issue Now
                            </Button>
                        </Link>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Home; 