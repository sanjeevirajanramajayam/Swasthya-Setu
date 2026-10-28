import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// 1. List all hospitals in multi-hospital network
router.get('/', async (req, res) => {
  try {
    const { state, tier } = req.query;
    let sql = 'SELECT * FROM hospitals WHERE 1=1';
    const params = [];

    if (state) {
      sql += ' AND state = ?';
      params.push(state);
    }
    if (tier) {
      sql += ' AND tier LIKE ?';
      params.push(`%${tier}%`);
    }

    sql += ' ORDER BY name ASC';
    const hospitals = await query(sql, params);

    // Attach doctor and encounter counts
    const enriched = await Promise.all(
      hospitals.map(async (h) => {
        const [docCount] = await query('SELECT COUNT(*) as count FROM doctors WHERE hospital_id = ?', [h.id]);
        const [encCount] = await query('SELECT COUNT(*) as count FROM encounters WHERE hospital_id = ?', [h.id]);
        const [apptCount] = await query('SELECT COUNT(*) as count FROM appointments WHERE hospital_id = ? AND status = "Scheduled"', [h.id]);
        return {
          ...h,
          doctorCount: docCount.count,
          encounterCount: encCount.count,
          activeAppointments: apptCount.count,
        };
      })
    );

    res.json({ success: true, count: enriched.length, hospitals: enriched });
  } catch (err) {
    console.error('Fetch hospitals error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch hospitals' });
  }
});

// 2. Get single hospital details with doctor roster
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hospitals = await query('SELECT * FROM hospitals WHERE id = ?', [id]);
    if (!hospitals.length) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const hospital = hospitals[0];
    const doctors = await query('SELECT * FROM doctors WHERE hospital_id = ?', [hospital.id]);
    const recentEncounters = await query(`
      SELECT e.*, w.full_name as worker_name, w.umhid as worker_umhid, d.name as doctor_name
      FROM encounters e
      JOIN migrant_workers w ON e.migrant_worker_id = w.id
      JOIN doctors d ON e.doctor_id = d.id
      WHERE e.hospital_id = ?
      ORDER BY e.encounter_date DESC
      LIMIT 10
    `, [hospital.id]);

    res.json({
      success: true,
      hospital,
      doctors,
      recentEncounters
    });
  } catch (err) {
    console.error('Hospital details error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch hospital details' });
  }
});

// 3. Add doctor to hospital
router.post('/:id/doctors', async (req, res) => {
  try {
    const hospital_id = req.params.id;
    const { name, specialization, qualification, registration_no, phone, email, department } = req.body;

    if (!name || !specialization || !registration_no) {
      return res.status(400).json({ success: false, message: 'Missing mandatory doctor fields' });
    }

    const result = await query(
      `INSERT INTO doctors (hospital_id, name, specialization, qualification, registration_no, phone, email, department)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [hospital_id, name, specialization, qualification || 'MBBS', registration_no, phone || '', email || '', department || 'General Medicine']
    );

    res.status(201).json({
      success: true,
      message: 'Doctor successfully added to hospital network roster',
      doctorId: result.insertId
    });
  } catch (err) {
    console.error('Add doctor error:', err);
    res.status(500).json({ success: false, message: 'Failed to add doctor' });
  }
});

export default router;
