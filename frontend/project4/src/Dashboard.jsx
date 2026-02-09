import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Container, Table, Button, Alert, Row, Col, Card, Navbar, Badge, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    // Updated state to hold Categories and Questions per project requirements
    const [forumData, setForumData] = useState({ categories: [], questions: [] });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    const canvasRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // (Starfield Logic - Unchanged)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || isLoading) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        const stars = Array.from({ length: 150 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random()
        }));
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            stars.forEach(star => {
                ctx.globalAlpha = star.opacity;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
                star.y += star.speed;
                if (star.y > canvas.height) star.y = 0;
                star.opacity += (Math.random() - 0.5) * 0.05;
                if (star.opacity < 0.1) star.opacity = 0.1;
                if (star.opacity > 1) star.opacity = 1;
            });
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, [isLoading]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/'); 
        const fetchForumData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${baseURL}/api/exploration-data`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json(); 
                if (response.ok) {
                    setForumData({
                        categories: data.categories || [],
                        questions: data.questions || []
                    });
                } else {
                    setError(data.error || 'Failed to fetch mission data');
                }
            } catch (err) {
                setError('Mission Control: Connection lost');
            } finally {
                setIsLoading(false);
            }
        };
        fetchForumData();
    }, [baseURL, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    // Filter questions based on category selection AND search term
    const filteredQuestions = useMemo(() => {
        let results = forumData.questions;
        if (selectedCategory) {
            results = results.filter(q => q.category_id === selectedCategory);
        }
        if (searchTerm) {
            results = results.filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return results;
    }, [searchTerm, forumData.questions, selectedCategory]);

    if (isLoading) {
        return (
            <div style={styles.dashboardWrapper} className="d-flex flex-column justify-content-center align-items-center">
                <Spinner animation="grow" variant="info" />
                <p className="mt-3 font-monospace text-info">SCANNING SECTORS...</p>
            </div>
        );
    }

    return (
        <div style={styles.dashboardWrapper}>
            <canvas ref={canvasRef} style={styles.starfieldCanvas} />

            <style>
                {`
                    .glass-card { transition: all 0.3s ease; cursor: pointer; }
                    .glass-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(0, 212, 255, 0.3) !important; }
                    .active-card { border: 2px solid #00d4ff !important; background: rgba(0, 212, 255, 0.1) !important; }
                    .blue-hover-row { transition: background 0.2s; }
                    .blue-hover-row:hover { background-color: rgba(0, 212, 255, 0.05) !important; }
                    .glow-text { text-shadow: 0 0 8px rgba(0, 212, 255, 0.6); }
                `}
            </style>

            <div style={{ position: 'relative', zIndex: 2 }}>
                <Navbar variant="dark" style={styles.navbar} className="px-4 mb-4 sticky-top">
                    <Navbar.Brand className="fw-bold">
                        <span style={styles.neonText}>🚀 SPACE_OS FORUM</span>
                    </Navbar.Brand>
                    <Navbar.Collapse className="justify-content-end">
                        <div className="text-end me-3">
                            <div className="fw-bold text-info small">{user.username?.toUpperCase() || 'COMMANDER'}</div>
                        </div>
                        <Button variant="outline-danger" size="sm" onClick={handleLogout}>ABORT_SESSION</Button>
                    </Navbar.Collapse>
                </Navbar>

                <Container>
                    {error && <Alert variant="danger" style={styles.alertStyle}>{error}</Alert>}

                    {/* Category Selection Area */}
                    <h5 className="text-info mb-3 font-monospace">SELECT SECTOR:</h5>
                    <Row className="mb-4 g-4">
                        {forumData.categories.map((cat) => (
                            <Col md={4} key={cat.id}>
                                <Card 
                                    style={styles.statCard} 
                                    className={`glass-card ${selectedCategory === cat.id ? 'active-card' : ''}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    <Card.Body className="text-center">
                                        <h6 className="text-info font-monospace m-0">{cat.name.toUpperCase()}</h6>
                                        <small className="text-muted">{cat.description}</small>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div className='mb-5'>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search transmissions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchBar}
                            />
                        </InputGroup>
                    </div>

                    {/* Questions Table */}
                    <DataSection title={selectedCategory ? "Filtered Transmissions" : "All Sector Questions"} color="#00d4ff">
                        <Table responsive variant="dark" style={styles.modernTable}>
                            <thead>
                                <tr style={styles.tableHeaderRow}>
                                    <th className="ps-4">SUBJECT</th>
                                    <th>CONTENT</th>
                                    <th className="text-end pe-4">TIMESTAMP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQuestions.length > 0 ? (
                                    filteredQuestions.map(q => (
                                        <tr key={q.id} className="blue-hover-row" style={styles.tableRow}>
                                            <td className="ps-4 fw-bold glow-text" style={{color: '#00d4ff'}}>
                                                {q.title}
                                            </td>
                                            <td className="text-muted small">{q.content}</td>
                                            <td className="text-end pe-4 text-info font-monospace small">
                                                {new Date(q.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-5 text-muted">
                                            SELECT A CATEGORY TO VIEW ITS QUESTIONS
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </DataSection>
                </Container>
            </div>
        </div>
    );
};

const DataSection = ({ title, color, children }) => (
    <div className="mb-5">
        <h5 className="mb-3 fw-bold" style={{color, letterSpacing: '2px', borderLeft: `4px solid ${color}`, paddingLeft: '10px'}}>{title.toUpperCase()}</h5>
        {children}
    </div>
);

const styles = {
    dashboardWrapper: { backgroundColor: '#05070a', minHeight: '100vh', color: 'white', position: 'relative', overflowX: 'hidden', paddingBottom: '50px' },
    starfieldCanvas: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' },
    navbar: { background: 'rgba(5, 7, 10, 0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0, 212, 255, 0.2)' },
    neonText: { textShadow: '0 0 10px #00d4ff' },
    statCard: { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(5px)', borderRadius: '12px', border: '1px solid rgba(0, 212, 255, 0.1)' },
    modernTable: { background: 'rgba(255, 255, 255, 0.01)', borderRadius: '12px', overflow: 'hidden', fontSize: '0.9rem' },
    tableHeaderRow: { background: 'rgba(0, 212, 255, 0.05)', color: '#00d4ff', fontSize: '0.75rem', letterSpacing: '1px' },
    tableRow: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
    searchBar: { background: 'rgba(10, 13, 20, 0.8)', color: '#00d4ff', border: '1px solid #1a202c', borderRadius: '8px' },
    alertStyle: { background: 'rgba(29, 47, 178, 0.1)', border: '1px solid #dc3545', color: '#ff8888' }
};

export default Dashboard;