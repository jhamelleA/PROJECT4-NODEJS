require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const app = express();
const port = 8000;

app.use(express.json());
// Updated CORS to ensure headers like Authorization can pass through
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// --- JWT VERIFICATION MIDDLEWARE ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Fallback to the hardcoded string ONLY if .env isn't working
        const secret = process.env.JWT_SECRET || 'super_secret_space_key';
        const verified = jwt.verify(token, secret);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
};

app.get('/', (req, res) => {
    res.send('🚀 Mission Control Server is Online!');
});

// --- PROTECTED DATA ROUTE ---
app.get('/api/exploration-data', verifyToken, async (req, res) => {
    try {
        const [planets] = await db.query('SELECT * FROM planets');
        const [stars] = await db.query('SELECT * FROM stars');
        const [galaxies] = await db.query('SELECT * FROM galaxies');

        res.status(200).json({ planets, stars, galaxies });
    } catch (err) {
        console.error("Data Fetch Error:", err);
        res.status(500).json({ error: "Failed to retrieve celestial data" });
    }
});

// --- REGISTRATION ---
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Salt rounds = 10
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: 'User registered!' });
    } catch(err) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: "Failed to register user" });
    }
});

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            // User doesn't exist
            return res.status(401).json({ error: 'Email not found' });
        }

        const user = rows[0];
        
        // Compare the plain text password with the hashed password from DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const secret = process.env.JWT_SECRET || 'super_secret_space_key';
            const token = jwt.sign(
                { id: user.id, username: user.username }, 
                secret, 
                { expiresIn: '2h' }
            );

            res.status(200).json({ 
                message: `Welcome back, ${user.username}!`,
                token: token,
                user: { id: user.id, username: user.username }
            });
        } else {
            // Password didn't match
            res.status(401).json({ error: 'Incorrect password' });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Server error during login" });
    }
});

app.listen(port, async () => {
    console.log(`🚀 Mission Control online at http://localhost:${port}`);
    try {
        await db.query('SELECT 1');
        console.log('📡 Satellite Link Established (Database Connected)');
    } catch (err) {
        console.error('🛰️ Satellite Link Failed (DB Error):', err.message);
    }
});