import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// 1. List appointments with filtering
router.get('/', async (req, res) => {
  try {
    const { workerId, hospitalId, doctorId, status, date } = req.query;
    let sql = `
      SELECT a.*,
             w.full_name as worker_name, w.umhid as worker_umhid, w.phone as worker_phone, w.blood_group,
             h.name as hospital_name, h.state as hospital_state,
             d.name as doctor_name, d.specialization as doctor_specialization
      FROM appointments a
      JOIN migrant_workers w ON a.migrant_worker_id = w.id
      JOIN hospitals h ON a.hospital_id = h.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (workerId) {
      sql += ' AND (a.migrant_worker_id = ? OR w.umhid = ?)';
      params.push(workerId, workerId);
    }
    if (hospitalId) {
      sql += ' AND a.hospital_id = ?';
      params.push(hospitalId);
    }
    if (doctorId) {
      sql += ' AND a.doctor_id = ?';
      params.push(doctorId);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.token_number ASC';
    const appointments = await query(sql, params);
    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    console.error('Fetch appointments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
});

// 2. Book a new cross-hospital appointment
router.post('/', async (req, res) => {
  try {
    const {
      migrant_worker_id,
      hospital_id,
      doctor_id,
      department,
      appointment_date,
      time_slot,
      symptoms_summary
    } = req.body;

    if (!migrant_worker_id || !hospital_id || !appointment_date || !department) {
      return res.status(400).json({ success: false, message: 'Missing required appointment details' });
    }

    // Get current max token for that date & hospital
    const tokenQuery = await query(
      `SELECT COALESCE(MAX(token_number), 0) + 1 as next_token
       FROM appointments
       WHERE hospital_id = ? AND appointment_date = ?`,
      [hospital_id, appointment_date]
    );
    const tokenNumber = tokenQuery[0].next_token;

    const result = await query(
      `INSERT INTO appointments (
        migrant_worker_id, hospital_id, doctor_id, department,
        appointment_date, time_slot, token_number, status, symptoms_summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?)`,
      [
        migrant_worker_id, hospital_id, doctor_id || null, department,
        appointment_date, time_slot || '10:00 AM - 10:30 AM', tokenNumber, symptoms_summary || 'General health consultation'
      ]
    );

    res.status(201).json({
      success: true,
      message: `Appointment confirmed with Token #${tokenNumber}`,
      appointmentId: result.insertId,
      tokenNumber
    });
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ success: false, message: 'Failed to book appointment' });
  }
});

// 3. Update appointment status (e.g., Scheduled -> In-Consultation -> Completed)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Scheduled', 'In-Consultation', 'Completed', 'Cancelled', 'No-Show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: `Appointment status updated to ${status}` });
  } catch (err) {
    console.error('Update appointment status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

export default router;
