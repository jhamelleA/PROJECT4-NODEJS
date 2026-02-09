require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const app = express();
const port = 8000;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// --- JWT VERIFICATION MIDDLEWARE ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
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

// --- GET FORUM DATA (Updated to ensure Content is selected) ---
app.get('/api/exploration-data', verifyToken, async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        const [questions] = await db.query(`
            SELECT 
                q.id, 
                q.title, 
                q.content, 
                q.created_at, 
                q.category_id, 
                c.name AS category_name 
            FROM questions q 
            JOIN categories c ON q.category_id = c.id 
            ORDER BY q.created_at DESC
        `);
        res.status(200).json({ categories, questions });
    } catch (err) {
        console.error("Data Fetch Error:", err);
        res.status(500).json({ error: "Failed to retrieve forum data" });
    }
});

// --- NEW: POST A QUESTION ---
app.post('/api/questions', verifyToken, async (req, res) => {
    const { title, content, category_id } = req.body;
    const userId = req.user.id; 

    if (!title || !content || !category_id) {
        return res.status(400).json({ error: "Transmission incomplete. All fields required." });
    }

    try {
        await db.query(
            'INSERT INTO questions (title, content, category_id, user_id) VALUES (?, ?, ?, ?)',
            [title, content, category_id, userId]
        );
        res.status(201).json({ message: "Transmission recorded in database." });
    } catch (err) {
        console.error("Post Error:", err);
        res.status(500).json({ error: "Failed to save transmission" });
    }
});

// --- REGISTRATION ---
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
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

// --- LOGIN (Updated to use USERNAME instead of EMAIL) ---
// --- LOGIN ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (rows.length === 0) {
            // Added 'field' key so frontend knows exactly where to show the red text
            return res.status(401).json({ error: 'Username not found', field: 'username' });
        }

        const user = rows[0];
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
            // Added 'field' key here too
            res.status(401).json({ error: 'Incorrect password', field: 'password' });
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