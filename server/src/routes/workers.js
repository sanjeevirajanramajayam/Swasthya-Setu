import express from 'express';
import QRCode from 'qrcode';
import { query } from '../config/db.js';

const router = express.Router();

// Helper to generate UMHID
function generateUMHID() {
  const year = new Date().getFullYear();
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `IND-MIG-${year}-${random4}`;
}

// 1. List all migrant workers (for search, directory, or doctor lookup)
router.get('/', async (req, res) => {
  try {
    const { search, state, sector } = req.query;
    let sql = 'SELECT * FROM migrant_workers WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (full_name LIKE ? OR umhid LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (state) {
      sql += ' AND (current_state = ? OR state_of_origin = ?)';
      params.push(state, state);
    }
    if (sector) {
      sql += ' AND occupation_sector LIKE ?';
      params.push(`%${sector}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const workers = await query(sql, params);
    res.json({ success: true, count: workers.length, workers });
  } catch (err) {
    console.error('Fetch workers error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch workers' });
  }
});

// 2. Get single worker by UMHID, ID, or QR token
router.get('/lookup/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const workers = await query(
      `SELECT * FROM migrant_workers WHERE umhid = ? OR id = ? OR qr_token = ? OR phone = ?`,
      [identifier, identifier, identifier, identifier]
    );

    if (!workers || workers.length === 0) {
      return res.status(404).json({ success: false, message: 'Migrant worker not found' });
    }

    const worker = workers[0];

    // Generate dynamic QR Code Data URL embedding Emergency Health Passport
    const qrPayload = JSON.stringify({
      umhid: worker.umhid,
      name: worker.full_name,
      dob: worker.dob,
      bloodGroup: worker.blood_group,
      allergies: worker.allergies,
      chronic: worker.chronic_conditions,
      emergencyContact: `${worker.emergency_contact_name} (${worker.emergency_contact_relation}) - ${worker.emergency_contact_phone}`,
      origin: `${worker.district_of_origin || ''}, ${worker.state_of_origin}`,
      current: `${worker.current_district || ''}, ${worker.current_state}`,
      sector: worker.occupation_sector,
      token: worker.qr_token,
      verificationUrl: `http://localhost:5173/scan/${worker.umhid}`
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 8,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      worker: {
        ...worker,
        qrCodeImage: qrDataUrl,
        qrPayload: JSON.parse(qrPayload)
      }
    });
  } catch (err) {
    console.error('Worker lookup error:', err);
    res.status(500).json({ success: false, message: 'Failed to lookup worker' });
  }
});

// 3. Get complete longitudinal medical history (Multi-Hospital Federated Timeline)
router.get('/:id/longitudinal-history', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch worker details
    const workers = await query('SELECT * FROM migrant_workers WHERE id = ? OR umhid = ?', [id, id]);
    if (!workers || workers.length === 0) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    const worker = workers[0];

    // Fetch all encounters across all participating hospital networks
    const encounters = await query(
      `SELECT e.*,
              h.name as hospital_name, h.code as hospital_code, h.state as hospital_state,
              h.district as hospital_district, h.tier as hospital_tier,
              d.name as doctor_name, d.specialization as doctor_specialization, d.department as doctor_department
       FROM encounters e
       JOIN hospitals h ON e.hospital_id = h.id
       JOIN doctors d ON e.doctor_id = d.id
       WHERE e.migrant_worker_id = ?
       ORDER BY e.encounter_date DESC`,
      [worker.id]
    );

    // For each encounter, fetch prescriptions and lab reports
    const enrichedEncounters = await Promise.all(
      encounters.map(async (enc) => {
        const prescriptions = await query(
          'SELECT * FROM prescriptions WHERE encounter_id = ? ORDER BY id ASC',
          [enc.id]
        );
        const labReports = await query(
          'SELECT * FROM lab_reports WHERE encounter_id = ? ORDER BY id ASC',
          [enc.id]
        );
        return {
          ...enc,
          prescriptions,
          labReports
        };
      })
    );

    // Fetch appointments
    const appointments = await query(
      `SELECT a.*, h.name as hospital_name, h.state as hospital_state, d.name as doctor_name
       FROM appointments a
       JOIN hospitals h ON a.hospital_id = h.id
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.migrant_worker_id = ?
       ORDER BY a.appointment_date DESC`,
      [worker.id]
    );

    // Fetch audit trail of who accessed this worker's records
    const auditLogs = await query(
      `SELECT al.*, h.name as hospital_name, u.full_name as accessor_name, u.role as accessor_role
       FROM access_audit_logs al
       LEFT JOIN hospitals h ON al.hospital_id = h.id
       LEFT JOIN users u ON al.accessor_user_id = u.id
       WHERE al.migrant_worker_id = ?
       ORDER BY al.timestamp DESC`,
      [worker.id]
    );

    // Compute distinct hospitals visited
    const hospitalSet = new Set();
    encounters.forEach(e => hospitalSet.add(`${e.hospital_name} (${e.hospital_state})`));

    res.json({
      success: true,
      worker,
      statistics: {
        totalEncounters: encounters.length,
        distinctHospitalNetworks: hospitalSet.size,
        hospitalsList: Array.from(hospitalSet),
        totalPrescriptions: enrichedEncounters.reduce((sum, e) => sum + e.prescriptions.length, 0),
        totalLabReports: enrichedEncounters.reduce((sum, e) => sum + e.labReports.length, 0),
      },
      encounters: enrichedEncounters,
      appointments,
      auditLogs
    });
  } catch (err) {
    console.error('Longitudinal history error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch medical history' });
  }
});

// 4. Register new migrant worker
router.post('/register', async (req, res) => {
  try {
    const {
      full_name,
      dob,
      gender,
      blood_group,
      phone,
      state_of_origin,
      district_of_origin,
      current_state,
      current_district,
      current_address,
      occupation_sector,
      employer_or_contractor,
      primary_language,
      emergency_contact_name,
      emergency_contact_relation,
      emergency_contact_phone,
      chronic_conditions,
      allergies,
      vaccination_status
    } = req.body;

    if (!full_name || !dob || !gender || !blood_group || !phone || !state_of_origin || !current_state) {
      return res.status(400).json({ success: false, message: 'Missing mandatory fields for worker registration' });
    }

    const umhid = generateUMHID();
    const qr_token = `QR_${umhid.replace(/-/g, '_')}_SECURE_${Date.now()}`;

    const result = await query(
      `INSERT INTO migrant_workers (
        umhid, full_name, dob, gender, blood_group, phone,
        state_of_origin, district_of_origin, current_state, current_district, current_address,
        occupation_sector, employer_or_contractor, primary_language,
        emergency_contact_name, emergency_contact_relation, emergency_contact_phone,
        chronic_conditions, allergies, vaccination_status, qr_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        umhid, full_name, dob, gender, blood_group, phone,
        state_of_origin, district_of_origin || '', current_state, current_district || '', current_address || '',
        occupation_sector || 'General Construction', employer_or_contractor || 'Independent', primary_language || 'hi',
        emergency_contact_name || 'Relative', emergency_contact_relation || 'Kin', emergency_contact_phone || phone,
        chronic_conditions || 'None Reported', allergies || 'None Known', vaccination_status || 'Partially Vaccinated',
        qr_token
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Migrant worker successfully registered with Universal Health ID',
      worker: {
        id: result.insertId,
        umhid,
        full_name,
        phone,
        blood_group,
        state_of_origin,
        current_state,
        qr_token
      }
    });
  } catch (err) {
    console.error('Worker registration error:', err);
    res.status(500).json({ success: false, message: 'Failed to register migrant worker' });
  }
});

// 5. Update worker profile (e.g. language or contact change)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      primary_language,
      current_state,
      current_district,
      current_address,
      phone,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      occupation_sector,
      employer_or_contractor,
      chronic_conditions,
      allergies
    } = req.body;

    await query(
      `UPDATE migrant_workers SET
        primary_language = COALESCE(?, primary_language),
        current_state = COALESCE(?, current_state),
        current_district = COALESCE(?, current_district),
        current_address = COALESCE(?, current_address),
        phone = COALESCE(?, phone),
        emergency_contact_name = COALESCE(?, emergency_contact_name),
        emergency_contact_phone = COALESCE(?, emergency_contact_phone),
        emergency_contact_relation = COALESCE(?, emergency_contact_relation),
        occupation_sector = COALESCE(?, occupation_sector),
        employer_or_contractor = COALESCE(?, employer_or_contractor),
        chronic_conditions = COALESCE(?, chronic_conditions),
        allergies = COALESCE(?, allergies)
       WHERE id = ? OR umhid = ?`,
      [
        primary_language, current_state, current_district, current_address, phone,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
        occupation_sector, employer_or_contractor, chronic_conditions, allergies,
        id, id
      ]
    );

    res.json({ success: true, message: 'Worker profile updated successfully' });
  } catch (err) {
    console.error('Update worker error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

export default router;
