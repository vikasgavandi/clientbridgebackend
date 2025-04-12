require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config');
const morgan = require('morgan');
const helmet = require('helmet');

const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://vikasgavandi.github.io'
}));

app.use(morgan('combined'));
app.use(helmet());

// Helper for error handling
const handleQueryError = (err, res) => {
  console.error('Database query failed:', err);
  res.status(500).json({ error: 'Database query failed', details: err.message });
};

// Default Route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Login Route
app.post('/login', (req, res) => {
  const { name, username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  res.status(200).json({ message: 'Data received successfully' });
});

// Get all data by role
app.get('/alldata', async (req, res) => {
  const { role } = req.query;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    const [results] = await pool.query('SELECT email, name, role FROM `login` WHERE role = ?', [role]);
    res.status(200).json(results);
  } catch (err) {
    handleQueryError(err, res);
  }
});

// Get all client data
app.get('/clientdata', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM `details_brand`');
    res.status(200).json(results);
  } catch (err) {
    handleQueryError(err, res);
  }
});

// Get unique companies with their count
app.get('/api/compdata', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT current_comp, COUNT(current_comp) AS count 
      FROM details_brand 
      GROUP BY current_comp 
      HAVING current_comp IS NOT NULL AND current_comp <> ''
    `);
    res.status(200).json(results);
  } catch (err) {
    handleQueryError(err, res);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try another port.`);
  } else {
    console.error('Server error:', err);
  }
});
