import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, FloatingLabel, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
    const [islogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    // NEW: State to track specific field errors
    const [errors, setErrors] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (message.text) setMessage({ text: '', type: '' });
        // Clear specific error when user starts typing again
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({ username: '', password: '' }); // Reset errors
        
        const endPoint = islogin ? '/api/login' : '/api/register';
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

        try {
            const response = await fetch(`${baseURL}${endPoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: islogin ? undefined : formData.email,
                    password: formData.password
                }),
            });

            // Inside your handleSubmit function...
                const data = await response.json();

                if (response.ok) {
                    // ... success logic ...
                } else {
                    // We now check the explicit 'field' returned by your backend
                    setErrors({
                        username: data.field === 'username' ? 'Invalid' : '',
                        password: data.field === 'password' ? 'Incorrect' : ''
                    });
                    setMessage({ text: data.error || 'Invalid credentials', type: 'danger' });
                    setIsLoading(false);
                }
                        } catch (e) {
                            setMessage({ text: 'Unable to connect to server', type: 'danger' });
                            setIsLoading(false);
                        }
                    }

    return (
        <div style={styles.backgroundWrapper}>
            <Container>
                <Row className='justify-content-center w-100 m-0'>
                    <Col xs={12} sm={10} md={8} lg={5} className="d-flex justify-content-center">
                        <Card className='border-0 shadow-lg w-100' style={styles.card}>
                            <Card.Body className='p-4 p-md-5'>
                                <div style={styles.headerContainer}>
                                    <h2 style={styles.headerTitle}>{islogin ? 'Welcome Back' : 'Create Account'}</h2>
                                    <div style={styles.headerUnderline}></div>
                                </div>

                                {message.text && message.type === 'success' && (
                                    <div className="alert alert-success text-center border-0 small py-2 mb-4">
                                        {message.text}
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    {/* USERNAME FIELD */}
                                    <div className="position-relative mb-3">
                                        {errors.username && (
                                            <span style={styles.errorLabel}>
                                                {errors.username}
                                            </span>
                                        )}
                                        <FloatingLabel label="Username" className="text-muted">
                                            <Form.Control
                                                name='username'
                                                placeholder='Username'
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                                isInvalid={!!errors.username}
                                                className="bg-light border-0 shadow-none"
                                                style={styles.inputField}
                                            />
                                        </FloatingLabel>
                                    </div>

                                    {/* EMAIL FIELD */}
                                    {!islogin && (
                                        <FloatingLabel label="Email Address" className="mb-3 text-muted">
                                            <Form.Control
                                                type='email'  
                                                name='email'
                                                placeholder='name@example.com'  
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                style={styles.inputField}
                                            />
                                        </FloatingLabel>
                                    )}

                                    {/* PASSWORD FIELD */}
                                    <Form.Group className='mb-2 position-relative'>
                                        {errors.password && (
                                            <span style={styles.errorLabel}>
                                                {errors.password}
                                            </span>
                                        )}
                                        <FloatingLabel label="Password" title="Password" className="text-muted">
                                            <Form.Control
                                                type={showPassword ? 'text' : 'password'}
                                                name='password'
                                                placeholder='Password'  
                                                value={formData.password}  
                                                onChange={handleChange}
                                                required
                                                isInvalid={!!errors.password}
                                                style={{ ...styles.inputField, paddingRight: '50px' }}
                                            />
                                        </FloatingLabel>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={styles.passwordToggle}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </Form.Group>

                                    <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                                        <Form.Check
                                            type="checkbox"
                                            label={<span className="small text-muted">Remember me</span>}
                                            id="rememberMe"
                                        />
                                        {islogin && (
                                            <button type="button" className="btn btn-link p-0 small text-decoration-none">
                                                Forgot Password?
                                            </button>
                                        )}
                                    </div>

                                    <Button
                                        variant='primary'
                                        type='submit'
                                        className='w-100 py-3 fw-bold shadow-sm mb-3 border-0'
                                        disabled={isLoading}
                                        style={styles.submitBtn}
                                    >
                                        {isLoading ? <Spinner animation="border" size="sm" /> : (islogin ? 'Sign In' : 'Register Now')}
                                    </Button>
                                </Form>

                                <div className='text-center'>
                                    <button
                                        className='btn btn-link text-decoration-none text-muted small'
                                        onClick={() => {
                                            setIsLogin(!islogin);
                                            setMessage({ text: '', type: '' });
                                            setErrors({ username: '', password: '' });
                                        }}
                                    >
                                        {islogin ? "Don't have an account? Register" : "Already have an account? Login"}
                                    </button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

const styles = {
    // ... rest of your styles ...
    errorLabel: {
        position: 'absolute',
        right: '15px',
        top: '18px', // Adjusted to align with the text in a FloatingLabel
        zIndex: 10,
        color: '#dc3545',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        pointerEvents: 'none'
    },
    backgroundWrapper: {
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'fixed', top: 0, left: 0
    },
    headerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' },
    headerTitle: { fontWeight: '800', color: '#2d3436', fontSize: '1.75rem' },
    headerUnderline: { width: '40px', height: '4px', background: 'linear-gradient(to right, #6c5ce7, #a29bfe)', borderRadius: '10px', margin: '12px 0' },
    inputField: { borderRadius: '12px', transition: 'all 0.3s ease' },
    passwordToggle: {
        position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)',
        border: 'none', background: 'none', color: '#6c5ce7', fontWeight: '600', fontSize: '0.8rem', zIndex: 5
    },
    submitBtn: { background: 'linear-gradient(to right, #6c5ce7, #a29bfe)', borderRadius: '12px' }
};

export default AuthForm;