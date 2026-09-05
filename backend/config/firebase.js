const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// ── Firebase Admin init ───────────────────────────────────────────────────────
// Expects FIREBASE_SERVICE_ACCOUNT env var to contain the service account JSON
// (as a single-line string) for project "gigo-company-ltd".
// NOTE: this whole file goes away in Phase B when Firebase is replaced by JWT.
if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
        credential: cert(serviceAccount),
    });
}

const firebaseAuth = getAuth();

module.exports = { firebaseAuth };
