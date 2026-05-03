const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { validateBody } = require('../middleware/validate');
const { emailSchema, loginSchema } = require('../schemas/authSchemas');
const { query } = require('../db');
const { jwt: jwtConfig } = require('../config');

const router = express.Router();

router.post('/register', validateBody(emailSchema.append({ password: Joi.string().min(8).required() })), async (req, res) => {
  const { email, password } = req.body;
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await query(
    'INSERT INTO users (email, password_hash, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, role',
    [email, hashedPassword, 'patient']
  );
  const user = result.rows[0];
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
  res.status(201).json({ token, user });
});

router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const result = await query('SELECT id, email, password_hash, role FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    const result = await query('SELECT id, email, role, full_name FROM users WHERE id = $1', [payload.id]);
    return res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
