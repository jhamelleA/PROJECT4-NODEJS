import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, FloatingLabel, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
    const [islogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (message.text) setMessage({ text: '', type: '' });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const endPoint = islogin ? '/api/login' : '/api/register';
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

        try {
            const response = await fetch(`${baseURL}${endPoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: formData.username,
                    email: formData.email, 
                    password: formData.password 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // --- NEW CODE START ---
                if (islogin) {
                    // 1. Store the token for the "Bouncer" (Middleware)
                    localStorage.setItem('token', data.token);
                    
                    // 2. Store user info for the Dashboard display
                    localStorage.setItem('user', JSON.stringify(data.user));

                    setMessage({ text: data.message || 'Access Granted! Redirecting...', type: 'success' });
                    
                    // Small delay so the user sees the success message
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 1000);
                } else {
                    // --- NEW CODE END ---
                    setMessage({ text: 'Account created! Please sign in.', type: 'success' });
                    setTimeout(() => {
                        setIsLogin(true);
                        setIsLoading(false);
                    }, 2000);
                }
            } else {
                setMessage({ text: data.error || 'Invalid credentials', type: 'danger' });
                setIsLoading(false);
            }
        } catch (e) {
            console.error("Connection Error:", e);
            setMessage({ text: 'Unable to connect to server', type: 'danger' });
            setIsLoading(false);
        }
    }

    // ... (rest of your return and styles remain exactly the same)
    return (
        <div style={styles.backgroundWrapper}>
            <Container>
                <Row className='justify-content-center w-100 m-0'>
                    <Col xs={12} sm={10} md={8} lg={5} className="d-flex justify-content-center">
                        <Card className='border-0 shadow-lg w-100' style={styles.card}>
                            <Card.Body className='p-4 p-md-5'>
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    textAlign: 'center',
                                    width: '100%',
                                    marginBottom: '2rem'
                                }}>
                                    <h2 style={{ 
                                        fontWeight: '800', 
                                        color: '#2d3436', 
                                        margin: 0, 
                                        fontSize: '1.75rem',
                                        letterSpacing: '-0.5px' 
                                    }}>
                                        {islogin ? 'Welcome Back' : 'Create Account'}
                                    </h2>
                                    
                                    <div style={{ 
                                        width: '40px', 
                                        height: '4px', 
                                        background: 'linear-gradient(to right, #6c5ce7, #a29bfe)', 
                                        borderRadius: '10px',
                                        margin: '12px 0'
                                    }}></div>

                                    <p style={{ 
                                        color: '#636e72', 
                                        fontSize: '0.9rem', 
                                        margin: 0,
                                        maxWidth: '280px' 
                                    }}>
                                        {islogin ? 'Enter your credentials to access your account' : 'Join our community and start your journey'}
                                    </p>
                                </div>

                                {message.text && message.type === 'success' && (
                                    <div className="alert alert-success text-center border-0 small py-2 mb-4">
                                        {message.text}
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    {!islogin && (
                                        <FloatingLabel label="Username" className="mb-3 text-muted">
                                            <Form.Control 
                                                name='username' 
                                                placeholder='Username' 
                                                value={formData.username} 
                                                onChange={handleChange} 
                                                required 
                                                className="bg-light border-0 shadow-none"
                                            />
                                        </FloatingLabel>
                                    )}

                                    <FloatingLabel label="Email Address" className="mb-3 text-muted">
                                      <Form.Control 
                                         type='email'  
                                         name='email' 
                                         placeholder='name@example.com'  
                                         value={formData.email} 
                                         onChange={handleChange} 
                                         required 
                                         style={{
                                            ...styles.inputField,
                                            borderColor: message.type === 'danger' ? '#dc3545' : '#ececec'
                                        }}
                                      />
                                    </FloatingLabel>

                                    <Form.Group className='mb-2 position-relative'>
                                        <FloatingLabel label="Password" title="Password" className="text-muted">
                                            <Form.Control 
                                                type={showPassword ? 'text' : 'password'} 
                                                name='password' 
                                                placeholder='Password'  
                                                value={formData.password}  
                                                onChange={handleChange} 
                                                required 
                                                style={
                                                    {...styles.inputField,
                                                    borderColor: message.type === 'danger' ? '#dc3545' : '#ececec',
                                                    paddingRight: '50px'
                                                    }}
                                                className={message.type === 'danger' ? 'is-invalid' : ''}
                                            />
                                        </FloatingLabel>
                                        
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={styles.passwordToggle}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>

                                        {message.text && message.type === 'danger' && (
                                            <div className="position-absolute top-50 start-100 translate-middle-y ps-3 d-none d-lg-block">
                                                <div className="bg-danger text-white px-3 py-1 rounded-pill small shadow-sm animate-fade-in" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                    {message.text}
                                                </div>
                                            </div>
                                        )}
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

                                    {message.text && message.type === 'danger' && (
                                        <div className="d-block d-lg-none text-danger text-center small mb-3 animate-fade-in fw-bold">
                                            {message.text}
                                        </div>
                                    )}

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
    backgroundWrapper: {
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradientBG 15s ease infinite',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0
    },
    passwordToggle: {
        position: 'absolute',
        right: '15px',
        top: '32px',
        border: 'none',
        background: 'none',
        color: '#6c5ce7',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        zIndex: 10
    },
    card: {
        borderRadius: '24px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: 'none'
    },
    inputField: {
        backgroundColor: '#f8f9fa', 
        border: '1.5px solid #ececec',
        borderRadius: '12px',
        padding: '12px',
        fontSize: '0.95rem',
        transition: 'all 0.2s ease-in-out',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
    },
    submitBtn: {
        borderRadius: '12px',
        backgroundImage: 'linear-gradient(to right, #6c5ce7, #a29bfe)',
        border: 'none',
        height: '50px',
        fontWeight: 'bold',
        cursor: 'pointer'
    }
};

export default AuthForm;