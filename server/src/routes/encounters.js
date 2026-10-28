import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// 1. Create new clinical encounter (Doctor records consultation + Prescriptions + Lab orders)
router.post('/', async (req, res) => {
  try {
    const {
      migrant_worker_id,
      hospital_id,
      doctor_id,
      encounter_type,
      chief_complaint,
      vitals_bp,
      vitals_pulse,
      vitals_spo2,
      vitals_temp,
      vitals_weight,
      diagnosis,
      icd10_code,
      occupational_hazard_flag,
      treatment_plan,
      clinical_notes,
      prescriptions = [],
      lab_reports = []
    } = req.body;

    if (!migrant_worker_id || !hospital_id || !doctor_id || !chief_complaint || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Missing mandatory encounter fields' });
    }

    // Insert Encounter
    const encounterResult = await query(
      `INSERT INTO encounters (
        migrant_worker_id, hospital_id, doctor_id, encounter_date, encounter_type,
        chief_complaint, vitals_bp, vitals_pulse, vitals_spo2, vitals_temp, vitals_weight,
        diagnosis, icd10_code, occupational_hazard_flag, treatment_plan, clinical_notes
      ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        migrant_worker_id, hospital_id, doctor_id, encounter_type || 'OPD',
        chief_complaint, vitals_bp || '120/80 mmHg', vitals_pulse || '72 bpm',
        vitals_spo2 || '98%', vitals_temp || '98.6 F', vitals_weight || '65 kg',
        diagnosis, icd10_code || 'Z00.0', occupational_hazard_flag || 'None',
        treatment_plan || '', clinical_notes || ''
      ]
    );

    const encounterId = encounterResult.insertId;

    // Insert Prescriptions
    if (Array.isArray(prescriptions) && prescriptions.length > 0) {
      for (const p of prescriptions) {
        if (p.medicine_name) {
          await query(
            `INSERT INTO prescriptions (encounter_id, medicine_name, dosage, frequency, timing, duration_days, instructions)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [encounterId, p.medicine_name, p.dosage || '1 unit', p.frequency || 'Once daily', p.timing || 'After Food', p.duration_days || 5, p.instructions || '']
          );
        }
      }
    }

    // Insert Lab Reports
    if (Array.isArray(lab_reports) && lab_reports.length > 0) {
      for (const l of lab_reports) {
        if (l.test_name) {
          await query(
            `INSERT INTO lab_reports (encounter_id, test_name, category, result_value, reference_range, unit, status, test_date, lab_technician, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
            [encounterId, l.test_name, l.category || 'General', l.result_value || 'Pending', l.reference_range || '', l.unit || '', l.status || 'Normal', l.lab_technician || 'Staff', l.notes || '']
          );
        }
      }
    }

    // Log in Access Audit Trail
    await query(
      `INSERT INTO access_audit_logs (migrant_worker_id, accessor_user_id, hospital_id, action, resource_type, details)
       VALUES (?, ?, ?, 'NEW_CLINICAL_ENCOUNTER', 'EHR_UPDATE', ?)`,
      [migrant_worker_id, doctor_id, hospital_id, `Consultation recorded: Diagnosis=${diagnosis} (ICD10: ${icd10_code || 'N/A'})`]
    );

    res.status(201).json({
      success: true,
      message: 'Clinical encounter successfully recorded across hospital network',
      encounterId
    });
  } catch (err) {
    console.error('Create encounter error:', err);
    res.status(500).json({ success: false, message: 'Failed to record encounter' });
  }
});

// 2. Export Interoperable HL7/FHIR R4 JSON Bundle
router.get('/fhir/bundle/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    const workers = await query('SELECT * FROM migrant_workers WHERE id = ? OR umhid = ?', [workerId, workerId]);
    if (!workers.length) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    const worker = workers[0];

    const encounters = await query(
      `SELECT e.*, h.name as hospital_name, h.code as hospital_code, h.state as hospital_state,
              d.name as doctor_name, d.registration_no as doctor_reg
       FROM encounters e
       JOIN hospitals h ON e.hospital_id = h.id
       JOIN doctors d ON e.doctor_id = d.id
       WHERE e.migrant_worker_id = ?
       ORDER BY e.encounter_date DESC`,
      [worker.id]
    );

    // Build FHIR R4 Bundle
    const fhirBundle = {
      resourceType: 'Bundle',
      id: `bundle-umhid-${worker.umhid}`,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/document']
      },
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: worker.umhid,
            identifier: [
              {
                system: 'https://swasthyasetu.gov.in/umhid',
                value: worker.umhid
              }
            ],
            name: [{ text: worker.full_name, use: 'official' }],
            telecom: [{ system: 'phone', value: worker.phone }],
            gender: worker.gender.toLowerCase(),
            birthDate: worker.dob,
            address: [
              {
                use: 'home',
                state: worker.current_state,
                district: worker.current_district,
                text: worker.current_address
              }
            ],
            extension: [
              {
                url: 'http://swasthyasetu.gov.in/fhir/StructureDefinition/blood-group',
                valueString: worker.blood_group
              },
              {
                url: 'http://swasthyasetu.gov.in/fhir/StructureDefinition/occupation-hazard',
                valueString: worker.occupation_sector
              }
            ]
          }
        },
        ...encounters.map(e => ({
          resource: {
            resourceType: 'Encounter',
            id: `enc-${e.id}`,
            status: 'finished',
            class: { code: e.encounter_type },
            subject: { reference: `Patient/${worker.umhid}` },
            period: { start: e.encounter_date },
            serviceProvider: { display: `${e.hospital_name}, ${e.hospital_state}` },
            participant: [{ individual: { display: e.doctor_name } }],
            reasonCode: [{ text: e.chief_complaint }],
            diagnosis: [
              {
                condition: { display: e.diagnosis },
                use: { coding: [{ code: e.icd10_code || 'Z00.0', system: 'http://hl7.org/fhir/sid/icd-10' }] }
              }
            ]
          }
        }))
      ]
    };

    res.json(fhirBundle);
  } catch (err) {
    console.error('FHIR export error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate FHIR Bundle' });
  }
});

export default router;
