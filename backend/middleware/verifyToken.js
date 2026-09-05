const jwt = require('jsonwebtoken');

// ── JWT access token verify ────────────────────────────────────────────────────
// Replaces Firebase ID-token verification (Phase B).
// Expects "Authorization: Bearer <accessToken>" where accessToken was issued
// by POST /auth/login or POST /auth/refresh and signed with JWT_ACCESS_SECRET.
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized - no token" });
    }
    const accessToken = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        req.user = { id: decoded.id, email: decoded.email }; // role/branch are NOT in the token; look up in MongoDB per route
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized - invalid or expired token" });
    }
};

module.exports = { verifyToken };
