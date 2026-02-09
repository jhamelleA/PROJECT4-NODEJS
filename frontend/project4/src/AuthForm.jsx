import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, FloatingLabel, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// --- SKELETON COMPONENT ---
// Added 'isLogin' prop to ensure the skeleton matches the actual form height
const AuthSkeleton = ({ isLogin }) => (
    <div style={styles.backgroundWrapper}>
        <style>
            {`
            @keyframes shimmer {
                100% { transform: translateX(100%); }
            }
            .skeleton-box {
                background: #eee;
                position: relative;
                overflow: hidden;
                background-color: #f2f2f2;
            }
            .skeleton-box::after {
                content: "";
                position: absolute;
                top: 0; right: 0; bottom: 0; left: 0;
                transform: translateX(-100%);
                background: linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
                animation: shimmer 1.5s infinite;
            }
            `}
        </style>
        <Container>
            <Row className='justify-content-center w-100 m-0'>
                <Col xs={12} sm={10} md={8} lg={5} className="d-flex justify-content-center">
                    <Card className='border-0 shadow-lg w-100' style={styles.card}>
                        <Card.Body className='p-4 p-md-5'>
                            <div className="d-flex flex-column align-items-center mb-5">
                                <div className="skeleton-box" style={{ width: '180px', height: '32px', marginBottom: '12px', borderRadius: '4px' }}></div>
                                <div className="skeleton-box" style={{ width: '40px', height: '4px', borderRadius: '10px' }}></div>
                            </div>
                            {/* Input 1 */}
                            <div className="skeleton-box mb-3" style={{ width: '100%', height: '58px', borderRadius: '12px' }}></div>
                            {/* Input 2 (Email field - only shown if registering) */}
                            {!isLogin && <div className="skeleton-box mb-3" style={{ width: '100%', height: '58px', borderRadius: '12px' }}></div>}
                            {/* Input 3 */}
                            <div className="skeleton-box mb-4" style={{ width: '100%', height: '58px', borderRadius: '12px' }}></div>
                            {/* Button */}
                            <div className="skeleton-box mb-4" style={{ width: '100%', height: '54px', borderRadius: '12px' }}></div>
                            <div className="d-flex justify-content-center">
                                <div className="skeleton-box" style={{ width: '60%', height: '15px', borderRadius: '4px' }}></div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    </div>
);

const AuthForm = () => {
    const [islogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true); 
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [errors, setErrors] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setPageLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (message.text) setMessage({ text: '', type: '' });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({ username: '', password: '' });
        
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

            const data = await response.json();

            if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setMessage({ text: data.message, type: 'success' });
            setTimeout(() => navigate('/dashboard'), 1500);
            }
        } catch (e) {
            setMessage({ text: 'Unable to connect to server', type: 'danger' });
            setIsLoading(false);
        }
    }

    if (pageLoading) return <AuthSkeleton isLogin={islogin} />;

    return (
        <div style={styles.backgroundWrapper}>
            {/* Added a Global Fade-In Animation */}
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .auth-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                `}
            </style>
            
            <Container className="auth-fade-in">
                <Row className='justify-content-center w-100 m-0'>
                    <Col xs={12} sm={10} md={8} lg={5} className="d-flex justify-content-center">
                        <Card className='border-0 shadow-lg w-100' style={styles.card}>
                            <Card.Body className='p-4 p-md-5'>
                                <div style={styles.headerContainer}>
                                    <h2 style={styles.headerTitle}>{islogin ? 'Welcome Back' : 'Create Account'}</h2>
                                    <div style={styles.headerUnderline}></div>
                                </div>

                                {message.text && (
                                    <div className={`alert alert-${message.type} text-center border-0 small py-2 mb-4 auth-fade-in`}>
                                        {message.text}
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <div className="position-relative mb-3">
                                        {errors.username && (
                                            <span style={styles.errorLabel}>{errors.username}</span>
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

                                    {!islogin && (
                                        <FloatingLabel label="Email Address" className="mb-3 text-muted auth-fade-in">
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

                                    <Form.Group className='mb-2 position-relative'>
                                        {errors.password && (
                                            <span style={{ ...styles.errorLabel, ...styles.passwordErrorOffset }}>
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
                                                style={{ ...styles.inputField, paddingRight: '80px' }}
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
                                            label={<span className="small text-muted">I agree to Terms and Conditions and Private Policy</span>}
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
    backgroundWrapper: {
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'fixed', top: 0, left: 0,
        animation: 'gradientBG 15s ease infinite', // Added smooth animation to the background
    },
    card: { borderRadius: '20px', overflow: 'hidden' },
    headerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' },
    headerTitle: { fontWeight: '800', color: '#2d3436', fontSize: '1.75rem' },
    headerUnderline: { width: '40px', height: '4px', background: 'linear-gradient(to right, #6c5ce7, #a29bfe)', borderRadius: '10px', margin: '12px 0' },
    inputField: { borderRadius: '12px', transition: 'all 0.3s ease', border: 'none', backgroundColor: '#f8f9fa' },
    errorLabel: {
        position: 'absolute', right: '15px', top: '18px', zIndex: 10,
        color: '#dc3545', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', pointerEvents: 'none'
    },
    passwordErrorOffset: { right: '65px' },
    passwordToggle: {
        position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)',
        border: 'none', background: 'none', color: '#6c5ce7', fontWeight: '600', fontSize: '0.8rem', zIndex: 11 
    },
    submitBtn: { background: 'linear-gradient(to right, #6c5ce7, #a29bfe)', borderRadius: '12px' }
};

export default AuthForm;