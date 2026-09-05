const { firebaseAuth } = require('../config/firebase');

// ── Firebase ID token verify ──────────────────────────────────────────────────
// NOTE: replaced by JWT verification in Phase B.
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized - no token" });
    }
    const idToken = authHeader.split(" ")[1];
    try {
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        req.user = { uid: decoded.uid, email: decoded.email }; // role/branch are NOT in the Firebase token; look up in MongoDB per route
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized - invalid token" });
    }
};

module.exports = { verifyToken };
