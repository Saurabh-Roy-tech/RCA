require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./config/db');
const rcaRoutes = require('./routes/rcaRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/rca', rcaRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('RCA API is running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
