import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ReportForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        issueType: '',
        image: null
    });
    const [position, setPosition] = useState([40.8448, -73.8648]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if we have location data from the "Report Near Me" feature
        if (location.state?.latitude && location.state?.longitude) {
            setPosition([location.state.latitude, location.state.longitude]);
        }
    }, [location.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                image: e.target.files[0]
            }));
        }
    };

    const handleMapClick = (e) => {
        setPosition([e.latlng.lat, e.latlng.lng]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('issueType', formData.issueType);
            formDataToSend.append('latitude', position[0]);
            formDataToSend.append('longitude', position[1]);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const response = await axios.post('http://localhost:5000/api/reports', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Report submitted successfully!');
            setFormData({
                title: '',
                description: '',
                location: '',
                issueType: '',
                image: null
            });
            setPosition([40.8448, -73.8648]);

            // Redirect to reports list after 2 seconds
            setTimeout(() => {
                navigate('/reports');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2 className="text-center mb-4">Report an Issue</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                placeholder="Brief description of the issue"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={3}
                                placeholder="Detailed description of the issue"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Location Description</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                placeholder="Street address or landmark"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Issue Type</Form.Label>
                            <Form.Select
                                name="issueType"
                                value={formData.issueType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select issue type</option>
                                <option value="pothole">Pothole</option>
                                <option value="graffiti">Graffiti</option>
                                <option value="streetlight">Street Light</option>
                                <option value="garbage">Garbage</option>
                                <option value="other">Other</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Image (optional)</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </Form.Group>

                        <div className="mb-4" style={{ height: '300px', borderRadius: '0.5rem', overflow: 'hidden' }}>
                            <MapContainer
                                center={position}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                                onClick={handleMapClick}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={position}>
                                    <Popup>
                                        Issue Location
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>

                        <div className="text-center">
                            <Button
                                variant="primary"
                                type="submit"
                                size="lg"
                                className="px-5"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default ReportForm; 