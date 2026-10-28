import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// 1. Get all disease surveillance events / outbreak hotspots (for Leaflet Map)
router.get('/outbreak-hotspots', async (req, res) => {
  try {
    const { category, severity, status } = req.query;
    let sql = 'SELECT * FROM disease_surveillance_events WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND disease_category = ?';
      params.push(category);
    }
    if (severity) {
      sql += ' AND severity_level = ?';
      params.push(severity);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY active_cases DESC';
    const outbreaks = await query(sql, params);

    // Compute aggregate metrics
    const totalActiveCases = outbreaks.reduce((sum, o) => sum + o.active_cases, 0);
    const totalWorkforceAtRisk = outbreaks.reduce((sum, o) => sum + (o.migrant_workforce_exposure || 0), 0);
    const criticalClusters = outbreaks.filter(o => o.severity_level === 'Critical' || o.severity_level === 'High').length;

    res.json({
      success: true,
      summary: {
        totalOutbreakClusters: outbreaks.length,
        totalActiveCases,
        totalWorkforceAtRisk,
        criticalClusters,
      },
      outbreaks
    });
  } catch (err) {
    console.error('Fetch outbreak hotspots error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch outbreak surveillance data' });
  }
});

// 2. Migration Health Corridor Analytics (Origin vs Inflow States)
router.get('/migration-analytics', async (req, res) => {
  try {
    // 1. Origin state distribution
    const originDistribution = await query(`
      SELECT state_of_origin, COUNT(*) as worker_count,
             GROUP_CONCAT(DISTINCT occupation_sector SEPARATOR ', ') as sectors
      FROM migrant_workers
      GROUP BY state_of_origin
      ORDER BY worker_count DESC
    `);

    // 2. Destination / Inflow state distribution
    const destinationDistribution = await query(`
      SELECT current_state, COUNT(*) as worker_count,
             COUNT(DISTINCT current_district) as districts_count
      FROM migrant_workers
      GROUP BY current_state
      ORDER BY worker_count DESC
    `);

    // 3. Occupational hazard distribution across workforce
    const occupationalHazards = await query(`
      SELECT
        occupational_hazard_flag,
        COUNT(*) as encounter_count
      FROM encounters
      WHERE occupational_hazard_flag != 'None'
      GROUP BY occupational_hazard_flag
      ORDER BY encounter_count DESC
    `);

    // 4. Disease Category breakdown
    const diseaseBreakdown = await query(`
      SELECT disease_category, SUM(active_cases) as total_cases, COUNT(*) as cluster_count
      FROM disease_surveillance_events
      GROUP BY disease_category
      ORDER BY total_cases DESC
    `);

    // 5. Total system metrics
    const [workerCount] = await query('SELECT COUNT(*) as total FROM migrant_workers');
    const [hospitalCount] = await query('SELECT COUNT(*) as total FROM hospitals');
    const [encounterCount] = await query('SELECT COUNT(*) as total FROM encounters');
    const [crossStateConsults] = await query(`
      SELECT COUNT(*) as total
      FROM encounters e
      JOIN migrant_workers w ON e.migrant_worker_id = w.id
      JOIN hospitals h ON e.hospital_id = h.id
      WHERE w.state_of_origin != h.state
    `);

    res.json({
      success: true,
      metrics: {
        totalRegisteredWorkers: workerCount.total,
        totalHospitalNetworks: hospitalCount.total,
        totalClinicalEncounters: encounterCount.total,
        crossStateInteroperableConsultations: crossStateConsults.total,
      },
      originDistribution,
      destinationDistribution,
      occupationalHazards,
      diseaseBreakdown,
    });
  } catch (err) {
    console.error('Migration analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch migration analytics' });
  }
});

// 3. Platform Security & Interoperability Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await query(`
      SELECT al.*,
             w.full_name as worker_name, w.umhid as worker_umhid,
             h.name as hospital_name, h.state as hospital_state,
             u.full_name as accessor_name, u.role as accessor_role
      FROM access_audit_logs al
      JOIN migrant_workers w ON al.migrant_worker_id = w.id
      LEFT JOIN hospitals h ON al.hospital_id = h.id
      LEFT JOIN users u ON al.accessor_user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT 100
    `);

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error('Fetch audit logs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
});

// 4. Create new disease surveillance alert (Public Health Officer can broadcast alert)
router.post('/outbreak-alert', async (req, res) => {
  try {
    const {
      disease_name,
      disease_category,
      district,
      state,
      lat,
      lng,
      cluster_name,
      active_cases,
      severity_level,
      migrant_workforce_exposure,
      recommended_intervention
    } = req.body;

    const result = await query(
      `INSERT INTO disease_surveillance_events (
        disease_name, disease_category, district, state, lat, lng,
        cluster_name, active_cases, severity_level, migrant_workforce_exposure,
        recommended_intervention, reported_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Active')`,
      [
        disease_name, disease_category || 'Respiratory', district, state,
        lat || 20.5937, lng || 78.9629, cluster_name, active_cases || 1,
        severity_level || 'High', migrant_workforce_exposure || 500,
        recommended_intervention || 'Public health monitoring initiated'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Epidemiological alert published to national surveillance grid',
      alertId: result.insertId
    });
  } catch (err) {
    console.error('Outbreak alert error:', err);
    res.status(500).json({ success: false, message: 'Failed to publish outbreak alert' });
  }
});

export default router;
