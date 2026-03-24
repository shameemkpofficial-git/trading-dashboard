const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'trading-dashboard-secret-key';
const TOKEN_EXPIRY = '24h';

// In-memory user store
const users = new Map();

/**
 * Register a new user
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{ok: boolean, error?: string, user?: object}>}
 */
async function register(username, password) {
  if (!username || !password) {
    return { ok: false, error: 'Username and password are required' };
  }

  const normalizedUsername = username.toLowerCase();
  if (users.has(normalizedUsername)) {
    return { ok: false, error: 'Username already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { username: normalizedUsername, password: hashedPassword };
  users.set(normalizedUsername, user);

  return { ok: true, user: { username: normalizedUsername } };
}

/**
 * Login a user
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{ok: boolean, error?: string, token?: string, user?: object}>}
 */
async function login(username, password) {
  if (!username || !password) {
    return { ok: false, error: 'Username and password are required' };
  }

  const normalizedUsername = username.toLowerCase();
  const user = users.get(normalizedUsername);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { ok: false, error: 'Invalid username or password' };
  }

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  return { ok: true, token, user: { username: user.username } };
}

/**
 * Express middleware to verify JWT
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

module.exports = {
  register,
  login,
  authenticateToken,
};
