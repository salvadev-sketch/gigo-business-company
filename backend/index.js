require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

app.use(cors());
app.use(express.json());

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
