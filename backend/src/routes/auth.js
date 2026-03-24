/**
 * routes/auth.js — Authentication routes: POST /register, POST /login
 */

const express = require('express');
const auth = require('../auth');
const { authLimiter } = require('../utils/rateLimiters');

const router = express.Router();

/**
 * POST /register
 * Register a new user.
 */
router.post('/register', authLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  const result = await auth.register(username, password);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }
  res.status(201).json(result.user);
});

/**
 * POST /login
 * Authenticate user and return JWT.
 */
router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  const result = await auth.login(username, password);
  if (!result.ok) {
    return res.status(401).json({ error: result.error });
  }
  res.json({ token: result.token, user: result.user });
});

module.exports = router;
