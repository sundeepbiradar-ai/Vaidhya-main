const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Placeholder user data - replace with database
const users = [];

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      id: users.length + 1,
      email,
      password: hashedPassword
    };
    users.push(user);

    // Generate token
    const jwtSecret = process.env.JWT_SECRET || 'defaultsecret';
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'defaultsecret';
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Check if a user exists
router.post('/check-user', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = users.find(u => u.email === email);
  return res.json({ exists: !!user });
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    res.json({ message: 'Password has been updated successfully. Please log in with your new password.' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Get profile
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;