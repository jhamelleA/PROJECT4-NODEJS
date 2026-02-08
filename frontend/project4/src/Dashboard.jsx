import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Container, Table, Button, Alert, Row, Col, Card, Navbar, Badge, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [explorationData, setExplorationData] = useState({ galaxies: [], planets: [], stars: [] });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState(null);
    
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
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${baseURL}/api/exploration-data`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json(); 
                if (response.ok) {
                    setExplorationData({
                        galaxies: data.galaxies || [],
                        planets: data.planets || [],
                        stars: data.stars || []
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
        fetchAllData();
    }, [baseURL, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const filteredPlanets = useMemo(() => 
        (explorationData?.planets || []).filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, explorationData.planets]);

    const filteredStars = useMemo(() => 
        (explorationData?.stars || []).filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, explorationData.stars]);

    const filteredGalaxies = useMemo(() => 
        (explorationData?.galaxies || []).filter(g => g.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm, explorationData.galaxies]);

    const toggleHighlight = (type, id) => {
        const key = `${type}-${id}`;
        setSelectedRow(prev => prev === key ? null : key);
    };

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
                    .glass-card { transition: all 0.3s ease; z-index: 1; }
                    .glass-card:hover { transform: translateY(-5px); box-shadow: 0 0 20px rgba(0, 212, 255, 0.3) !important; }
                    
                    .blue-hover-row { transition: background 0.2s; cursor: pointer; }
                    .blue-hover-row:hover { background-color: rgba(0, 212, 255, 0.05) !important; }
                    
                    .row-highlighted { 
                        background-color: rgba(0, 212, 255, 0.15) !important; 
                        box-shadow: inset 4px 0 0 #00d4ff;
                    }

                    /* --- NEON TEXT GLOW CLASSES --- */
                    .glow-planet { text-shadow: 0 0 8px rgba(0, 255, 136, 0.6); }
                    .glow-star { text-shadow: 0 0 8px rgba(255, 204, 0, 0.6); }
                    .glow-galaxy { text-shadow: 0 0 8px rgba(0, 212, 255, 0.6); }
                    
                    /* Secondary glow for descriptions to keep them readable */
                    .glow-muted { text-shadow: 0 0 5px rgba(255, 255, 255, 0.1); }
                `}
            </style>

            <div style={{ position: 'relative', zIndex: 2 }}>
                <Navbar variant="dark" style={styles.navbar} className="px-4 mb-4 sticky-top">
                    <Navbar.Brand className="fw-bold">
                        <span style={styles.neonText}>🚀 SPACE_OS</span>
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

                    <div className='mb-5'>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Filter sector coordinates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchBar}
                            />
                        </InputGroup>
                    </div>

                    <Row className="mb-5 g-4">
                        {[
                            { label: 'Planets', val: filteredPlanets.length, color: '#00ff88', icon: '🪐' },
                            { label: 'Stars', val: filteredStars.length, color: '#ffcc00', icon: '✨' },
                            { label: 'Galaxies', val: filteredGalaxies.length, color: '#00d4ff', icon: '🌀' }
                        ].map((stat, idx) => (
                            <Col md={4} key={idx}>
                                <Card style={{...styles.statCard, borderColor: stat.color}} className="glass-card">
                                    <Card.Body className="text-center">
                                        <div style={{fontSize: '1.2rem'}} className="mb-1">{stat.icon}</div>
                                        <h6 style={{color: stat.color, fontSize: '0.7rem', letterSpacing: '1px'}}>{stat.label.toUpperCase()}</h6>
                                        <h2 className="text-white m-0 fw-bold">{stat.val}</h2>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* --- PLANETS TABLE --- */}
                    <DataSection title="Planet Discoveries" color="#00ff88">
                        <Table responsive variant="dark" style={styles.modernTable}>
                            <thead>
                                <tr style={styles.tableHeaderRow}>
                                    <th className="ps-4">NAME</th>
                                    <th className="text-center">MOONS</th>
                                    <th className="text-end pe-4">CLASSIFICATION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlanets.map(p => (
                                    <tr 
                                        key={p.id} 
                                        onClick={() => toggleHighlight('planet', p.id)}
                                        className={`blue-hover-row ${selectedRow === `planet-${p.id}` ? 'row-highlighted' : ''}`} 
                                        style={styles.tableRow}
                                    >
                                        <td className="ps-4 fw-bold glow-planet" style={{color: '#00ff88'}}>{p.name}</td>
                                        <td className="text-center glow-muted">{p.moons}</td>
                                        <td className="text-end pe-4 text-muted small glow-muted">{p.planet_type?.toUpperCase()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </DataSection>

                    {/* --- STARS TABLE --- */}
                    <DataSection title="Celestial Stars" color="#ffcc00">
                        <Table responsive variant="dark" style={styles.modernTable}>
                            <thead>
                                <tr style={styles.tableHeaderRow}>
                                    <th className="ps-4">NAME</th>
                                    <th className="text-center">CONSTELLATION</th>
                                    <th className="text-end pe-4">DISTANCE (LY)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStars.map(s => (
                                    <tr 
                                        key={s.id} 
                                        onClick={() => toggleHighlight('star', s.id)}
                                        className={`blue-hover-row ${selectedRow === `star-${s.id}` ? 'row-highlighted' : ''}`} 
                                        style={styles.tableRow}
                                    >
                                        <td className="ps-4 fw-bold glow-star" style={{color: '#ffcc00'}}>{s.name}</td>
                                        <td className="text-center glow-muted">{s.constellation}</td>
                                        <td className="text-end pe-4 text-muted small glow-muted">{s.distance_light_years} LY</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </DataSection>

                    {/* --- GALAXIES TABLE --- */}
                    <DataSection title="Observed Galaxies" color="#00d4ff">
                        <Table responsive variant="dark" style={styles.modernTable}>
                            <thead>
                                <tr style={styles.tableHeaderRow}>
                                    <th className="ps-4">GALAXY NAME</th>
                                    <th className="text-center">SHAPE</th>
                                    <th className="text-end pe-4">DESCRIPTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGalaxies.map(g => (
                                    <tr 
                                        key={g.id} 
                                        onClick={() => toggleHighlight('galaxy', g.id)}
                                        className={`blue-hover-row ${selectedRow === `galaxy-${g.id}` ? 'row-highlighted' : ''}`} 
                                        style={styles.tableRow}
                                    >
                                        <td className="ps-4 fw-bold glow-galaxy" style={{color: '#00d4ff'}}>{g.name}</td>
                                        <td className="text-center"><Badge bg="dark" style={{border: '1px solid #00d4ff', color: '#00d4ff', boxShadow: '0 0 5px #00d4ff'}}>{g.shape}</Badge></td>
                                        <td className="text-end pe-4 text-muted small glow-muted">{g.description}</td>
                                    </tr>
                                ))}
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
        <h5 className="mb-3 fw-bold glow-muted" style={{color, letterSpacing: '2px', borderLeft: `4px solid ${color}`, paddingLeft: '10px'}}>{title.toUpperCase()}</h5>
        {children}
    </div>
);

const styles = {
    dashboardWrapper: { backgroundColor: '#05070a', minHeight: '100vh', color: 'white', position: 'relative', overflowX: 'hidden', paddingBottom: '50px' },
    starfieldCanvas: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' },
    navbar: { background: 'rgba(5, 7, 10, 0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0, 212, 255, 0.2)' },
    neonText: { textShadow: '0 0 10px #00d4ff' },
    statCard: { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(5px)', borderRadius: '12px' },
    modernTable: { background: 'rgba(255, 255, 255, 0.01)', borderRadius: '12px', overflow: 'hidden', fontSize: '0.9rem' },
    tableHeaderRow: { background: 'rgba(0, 212, 255, 0.05)', color: '#00d4ff', fontSize: '0.75rem', letterSpacing: '1px' },
    tableRow: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
    searchBar: { background: 'rgba(10, 13, 20, 0.8)', color: '#00d4ff', border: '1px solid #1a202c', borderRadius: '8px' },
    alertStyle: { background: 'rgba(29, 47, 178, 0.1)', border: '1px solid #dc3545', color: '#ff8888' }
};

export default Dashboard;