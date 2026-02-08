const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Look for the token in the 'Authorization' header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Splits "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: "Access Denied: No Token Provided" });
    }

    try {
        // Verify the token using your Secret Key from .env
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key');
        req.user = verified; // Add user info to the request object
        next(); // Move on to the actual route logic
    } catch (err) {
        res.status(403).json({ error: "Invalid or Expired Token" });
    }
};

module.exports = verifyToken;