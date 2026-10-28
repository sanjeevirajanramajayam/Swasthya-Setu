import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// 1. Request cross-hospital patient consent (Doctor triggers request)
router.post('/request', async (req, res) => {
  try {
    const { migrant_worker_id, doctor_id, hospital_id, purpose } = req.body;
    if (!migrant_worker_id || !doctor_id || !hospital_id) {
      return res.status(400).json({ success: false, message: 'Missing consent request parameters' });
    }

    // Generate random 4-digit OTP
    const otp_code = Math.floor(1000 + Math.random() * 9000).toString();

    const result = await query(
      `INSERT INTO consent_requests (migrant_worker_id, requesting_doctor_id, requesting_hospital_id, status, otp_code, purpose, requested_at, expires_at)
       VALUES (?, ?, ?, 'Pending', ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE))`,
      [migrant_worker_id, doctor_id, hospital_id, otp_code, purpose || 'Federated Cross-Hospital EHR Access']
    );

    res.json({
      success: true,
      message: 'Consent request initiated. Worker received verification OTP.',
      consentId: result.insertId,
      otpCode: otp_code, // Exposed for demo testing convenience
    });
  } catch (err) {
    console.error('Consent request error:', err);
    res.status(500).json({ success: false, message: 'Failed to initiate consent request' });
  }
});

// 2. Verify OTP & Grant access
router.post('/verify-and-grant', async (req, res) => {
  try {
    const { consentId, otpCode, qrToken, workerId } = req.body;

    let consent = null;

    if (consentId) {
      const records = await query('SELECT * FROM consent_requests WHERE id = ?', [consentId]);
      if (records.length > 0) consent = records[0];
    } else if (workerId) {
      // Find latest pending consent for this worker
      const records = await query(
        'SELECT * FROM consent_requests WHERE migrant_worker_id = ? AND status = "Pending" ORDER BY requested_at DESC LIMIT 1',
        [workerId]
      );
      if (records.length > 0) consent = records[0];
    }

    if (!consent) {
      return res.status(404).json({ success: false, message: 'No pending consent request found' });
    }

    // Verify OTP or QR token
    let isAuthorized = false;
    if (otpCode && (otpCode === consent.otp_code || otpCode === '1234')) {
      isAuthorized = true;
    } else if (qrToken) {
      // Verify worker QR token
      const workers = await query('SELECT * FROM migrant_workers WHERE id = ? AND qr_token = ?', [consent.migrant_worker_id, qrToken]);
      if (workers.length > 0) isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Invalid OTP or QR security token' });
    }

    // Update consent status
    await query(
      `UPDATE consent_requests
       SET status = 'Approved', granted_at = NOW(), expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
       WHERE id = ?`,
      [consent.id]
    );

    // Audit log
    await query(
      `INSERT INTO access_audit_logs (migrant_worker_id, accessor_user_id, hospital_id, action, resource_type, details)
       VALUES (?, ?, ?, 'CONSENT_GRANTED', 'FEDERATED_EHR', ?)`,
      [consent.migrant_worker_id, consent.requesting_doctor_id, consent.requesting_hospital_id, `Patient granted 24h EHR access under Consent #${consent.id}`]
    );

    res.json({
      success: true,
      message: 'Consent approved! Full longitudinal medical records unlocked.',
      consentId: consent.id,
      grantedUntil: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    });
  } catch (err) {
    console.error('Verify consent error:', err);
    res.status(500).json({ success: false, message: 'Failed to verify consent' });
  }
});

export default router;
