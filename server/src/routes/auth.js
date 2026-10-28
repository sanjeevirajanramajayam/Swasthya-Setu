import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_migrant_health_secret_key_2026';

// 1. Standard Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const users = await query(
      `SELECT u.*, h.name as hospital_name, h.state as hospital_state, h.code as hospital_code
       FROM users u
       LEFT JOIN hospitals h ON u.hospital_id = h.id
       WHERE u.username = ? OR u.email = ?`,
      [username, username]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    let workerProfile = null;
    let doctorProfile = null;

    if (user.role === 'WORKER') {
      const workers = await query('SELECT * FROM migrant_workers WHERE user_id = ?', [user.id]);
      if (workers.length > 0) workerProfile = workers[0];
    } else if (user.role === 'DOCTOR') {
      const doctors = await query('SELECT * FROM doctors WHERE user_id = ?', [user.id]);
      if (doctors.length > 0) doctorProfile = doctors[0];
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, hospital_id: user.hospital_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        hospital_id: user.hospital_id,
        hospital_name: user.hospital_name,
        hospital_code: user.hospital_code,
        hospital_state: user.hospital_state,
        workerProfile,
        doctorProfile,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 2. Demo Quick-Login Switcher (Allows seamless switching between all roles for evaluation)
router.get('/demo-users', async (req, res) => {
  try {
    const users = await query(`
      SELECT u.id, u.username, u.role, u.full_name, u.email, u.phone, u.hospital_id,
             h.name as hospital_name, h.state as hospital_state,
             w.umhid, w.occupation_sector, w.current_state as worker_current_state,
             d.specialization, d.department
      FROM users u
      LEFT JOIN hospitals h ON u.hospital_id = h.id
      LEFT JOIN migrant_workers w ON w.user_id = u.id
      LEFT JOIN doctors d ON d.user_id = u.id
      ORDER BY u.id ASC
    `);

    res.json({ success: true, users });
  } catch (err) {
    console.error('Demo users error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch demo users' });
  }
});

// 3. Quick Switch Auth (generates instant token for selected demo user)
router.post('/switch-demo-user', async (req, res) => {
  try {
    const { userId } = req.body;
    const users = await query(`
      SELECT u.*, h.name as hospital_name, h.state as hospital_state, h.code as hospital_code
      FROM users u
      LEFT JOIN hospitals h ON u.hospital_id = h.id
      WHERE u.id = ?
    `, [userId]);

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    let workerProfile = null;
    let doctorProfile = null;

    if (user.role === 'WORKER') {
      const workers = await query('SELECT * FROM migrant_workers WHERE user_id = ?', [user.id]);
      if (workers.length > 0) workerProfile = workers[0];
    } else if (user.role === 'DOCTOR') {
      const doctors = await query('SELECT * FROM doctors WHERE user_id = ?', [user.id]);
      if (doctors.length > 0) doctorProfile = doctors[0];
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, hospital_id: user.hospital_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        hospital_id: user.hospital_id,
        hospital_name: user.hospital_name,
        hospital_code: user.hospital_code,
        hospital_state: user.hospital_state,
        workerProfile,
        doctorProfile,
      },
    });
  } catch (err) {
    console.error('Switch user error:', err);
    res.status(500).json({ success: false, message: 'Failed to switch user' });
  }
});

export default router;
