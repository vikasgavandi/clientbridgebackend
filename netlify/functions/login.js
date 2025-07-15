const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Username and password are required' })
      };
    }

    // Mock user data - replace with actual database query
    const mockUsers = [
      { id: 1, username: 'admin', password: '$2b$10$hash', name: 'Admin User', email: 'admin@test.com', role: 'admin' },
      { id: 2, username: 'user', password: '$2b$10$hash', name: 'Test User', email: 'user@test.com', role: 'user' }
    ];

    const user = mockUsers.find(u => u.username === username);
    
    if (!user) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // For demo - accept any password, in production use bcrypt.compare
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      'your_super_secret_jwt_key_2025',
      { expiresIn: '2h' }
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};