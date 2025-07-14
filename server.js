require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./config');
const morgan = require('morgan');
const helmet = require('helmet');

const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors({
  origin: ['https://vikasgavandi.github.io', 'http://127.0.0.1:5500', 'http://localhost:2300'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('combined'));
app.use(helmet());

// Helper for error handling
const handleQueryError = (err, res) => {
  console.error('Database query failed:', err);
  res.status(500).json({ error: 'Database query failed', details: err.message });
};

// Default Route - redirect to login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Register Route
app.post('/register', async (req, res) => {
  const { name, username, email, password, role = 'user' } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM login WHERE username = ? OR email = ?', [username, email]);
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO login (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, username, email, hashedPassword, role]
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM login WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_default_secret',
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
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

// Middleware to validate admin
const isAdmin = (req, res, next) => {
  const role = req.query.role;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// CREATE
app.post('/admin/data', isAdmin, async (req, res) => {
  const data = req.body;
  try {
    const [result] = await pool.query(`
      INSERT INTO details_brand 
      (marketing_name, client_name, contact, current_comp, earlier_comp,
      brand_name, email_id, therapy_area, division, date, comment, last_call)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.marketing_name, data.client_name, data.contact, data.current_comp,
      data.earlier_comp, data.brand_name, data.email_id, data.therapy_area,
      data.division, data.date, data.comment, data.last_call
    ]);
    res.status(201).json({ message: 'Data added successfully', id: result.insertId });
  } catch (err) {
    handleQueryError(err, res);
  }
});

// READ
app.get('/admin/data', isAdmin, async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM details_brand');
    res.status(200).json(results);
  } catch (err) {
    handleQueryError(err, res);
  }
});

// UPDATE
app.put('/admin/data/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const [result] = await pool.query(`
      UPDATE details_brand SET 
        marketing_name = ?, client_name = ?, contact = ?, current_comp = ?,
        earlier_comp = ?, brand_name = ?, email_id = ?, therapy_area = ?,
        division = ?, date = ?, comment = ?, last_call = ?
      WHERE id = ?
    `, [
      data.marketing_name, data.client_name, data.contact, data.current_comp,
      data.earlier_comp, data.brand_name, data.email_id, data.therapy_area,
      data.division, data.date, data.comment, data.last_call, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.status(200).json({ message: 'Data updated successfully' });
  } catch (err) {
    handleQueryError(err, res);
  }
});

// DELETE
app.delete('/admin/data/:id', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM details_brand WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Data not found' });
    }

    res.status(200).json({ message: 'Data deleted successfully' });
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
