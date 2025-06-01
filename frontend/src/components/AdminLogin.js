import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminLogin() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/admin/login', credentials);
            if (response.data.isAdmin) {
                localStorage.setItem('isAdmin', 'true');
                navigate('/admin');
            }
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <Card className="border-0 shadow-sm" style={{ width: '400px' }}>
                <Card.Body className="p-4">
                    <Card.Title className="text-center mb-4 fs-4 fw-light">Admin Login</Card.Title>
                    {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-muted small">Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={credentials.username}
                                onChange={handleInputChange}
                                required
                                className="border-0 border-bottom rounded-0 px-0"
                                placeholder="Enter your username"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted small">Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleInputChange}
                                required
                                className="border-0 border-bottom rounded-0 px-0"
                                placeholder="Enter your password"
                            />
                        </Form.Group>

                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100 py-2 rounded-pill"
                        >
                            Sign In
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default AdminLogin; 