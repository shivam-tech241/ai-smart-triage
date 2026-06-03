import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/db.js';
import { logAudit } from '../middleware/audit.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smarttriage_secret_key';

export const register = (req, res) => {
  const { name, email, password, role, doctorId, adminSecretKey } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields (name, email, password, role) are required.' });
  }

  const normalizedRole = role.toLowerCase();
  if (!['patient', 'doctor', 'admin'].includes(normalizedRole)) {
    return res.status(400).json({ error: 'Invalid role specified.' });
  }

  // Doctor validation
  if (normalizedRole === 'doctor') {
    if (doctorId !== 'DOC-2026') {
      return res.status(400).json({ error: 'Invalid Doctor ID. Doctor registration requires ID: DOC-2026' });
    }
  }

  // Admin validation
  if (normalizedRole === 'admin') {
    if (adminSecretKey !== 'ADMIN@TRIAGE') {
      return res.status(400).json({ error: 'Invalid Admin Secret Key. Admin registration requires: ADMIN@TRIAGE' });
    }
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const docIdToStore = normalizedRole === 'doctor' ? 'DOC-2026' : null;

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, doctor_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, email, passwordHash, normalizedRole, docIdToStore);
    const userId = result.lastInsertRowid;

    logAudit(userId, 'register', '/api/auth/register');

    return res.status(201).json({
      message: 'Registration successful.',
      user: {
        id: userId,
        name,
        email,
        role: normalizedRole,
        doctor_id: docIdToStore
      }
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email address already in use.' });
    }
    console.error('Registration Error:', err);
    return res.status(500).json({ error: 'An error occurred during registration.' });
  }
};

export const login = (req, res) => {
  const { email } = req.body;
  // Handle password parameter from different potential input names (password, doctorId, adminKey)
  const password = req.body.password || req.body.doctorId || req.body.adminKey;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password (or key/ID) are required.' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordIsValid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Sign JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        doctor_id: user.doctor_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logAudit(user.id, 'login', '/api/auth/login');

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctor_id: user.doctor_id
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'An error occurred during login.' });
  }
};
