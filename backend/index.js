require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const branchRoutes = require('./routes/branches');
const statsRoutes = require('./routes/stats');
const reportRoutes = require('./routes/reports');

const app = express();
const port = process.env.PORT || 5000;

// origin must be an explicit URL (not "*") for the browser to accept a
// cross-site cookie from the refresh-token flow; falls back to reflecting
// the request origin in dev if FRONTEND_URL isn't set.
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
    res.send("GIGO COMPANY Backend is running!");
});

app.use(authRoutes);
app.use(productRoutes);
app.use(userRoutes);
app.use(orderRoutes);
app.use(inventoryRoutes);
app.use(branchRoutes);
app.use(statsRoutes);
app.use(reportRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
