import bcrypt from 'bcryptjs';
import { runMigrations } from './init.js';
import { getPool } from '../config/db.js';

export async function seedDatabase() {
  await runMigrations();
  const pool = getPool();

  console.log('[Seed] Checking existing data...');
  const [existingHospitals] = await pool.query('SELECT COUNT(*) as count FROM hospitals');
  if (existingHospitals[0].count > 0) {
    console.log('[Seed] Database already seeded with hospitals. Skipping duplicate seed.');
    return;
  }

  console.log('[Seed] Seeding hospitals...');
  const hospitals = [
    {
      id: 1,
      name: 'All India Institute of Medical Sciences (AIIMS)',
      code: 'AIIMS-DELHI',
      hospital_type: 'National Apex Institute',
      tier: 'Tier-1 Tertiary Super-specialty',
      state: 'Delhi',
      district: 'New Delhi',
      address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029',
      phone: '+91-11-26588500',
      email: 'care@aiims.edu',
      lat: 28.5672,
      lng: 77.2100,
    },
    {
      id: 2,
      name: 'Apollo Multispeciality Hospital',
      code: 'APOLLO-CHE',
      hospital_type: 'Private Super-specialty Network',
      tier: 'Tier-1 Tertiary',
      state: 'Tamil Nadu',
      district: 'Chennai',
      address: '21 Greams Lane, Thousand Lights, Chennai - 600006',
      phone: '+91-44-28290200',
      email: 'contact@apollohospitals.com',
      lat: 13.0604,
      lng: 80.2496,
    },
    {
      id: 3,
      name: 'King Edward Memorial (KEM) Hospital',
      code: 'KEM-MUMBAI',
      hospital_type: 'Municipal Tertiary Medical College',
      tier: 'Tier-1 Public Tertiary',
      state: 'Maharashtra',
      district: 'Mumbai',
      address: 'Acharya Donde Marg, Parel, Mumbai - 400012',
      phone: '+91-22-24107000',
      email: 'dean@kem.edu',
      lat: 19.0028,
      lng: 72.8427,
    },
    {
      id: 4,
      name: 'General Hospital Ernakulam',
      code: 'GH-ERNAKULAM',
      hospital_type: 'District Model Hospital',
      tier: 'Tier-2 Secondary & Migrant Inflow Center',
      state: 'Kerala',
      district: 'Ernakulam',
      address: 'Hospital Road, Marine Drive, Kochi, Kerala - 682011',
      phone: '+91-484-2361251',
      email: 'gheh@keralahealth.gov.in',
      lat: 9.9723,
      lng: 76.2784,
    },
    {
      id: 5,
      name: 'Burdwan District Medical Facility',
      code: 'BDM-WBENGAL',
      hospital_type: 'District Hospital & Rural Health Hub',
      tier: 'Tier-2 Outflow State Center',
      state: 'West Bengal',
      district: 'Purba Bardhaman',
      address: 'Grand Trunk Road, Burdwan, West Bengal - 713101',
      phone: '+91-342-2656333',
      email: 'health@burdwanmed.wb.gov.in',
      lat: 23.2324,
      lng: 87.8615,
    },
    {
      id: 6,
      name: 'Surat Industrial Worker Civil Hospital',
      code: 'CIVIL-SURAT',
      hospital_type: 'Public Occupational Health Center',
      tier: 'Tier-2 Industrial Care',
      state: 'Gujarat',
      district: 'Surat',
      address: 'Majura Gate, Ring Road, Surat, Gujarat - 395001',
      phone: '+91-261-2244456',
      email: 'civilhospital@surathealth.org',
      lat: 21.1702,
      lng: 72.8311,
    }
  ];

  for (const h of hospitals) {
    await pool.query(
      `INSERT INTO hospitals (id, name, code, hospital_type, tier, state, district, address, phone, email, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [h.id, h.name, h.code, h.hospital_type, h.tier, h.state, h.district, h.address, h.phone, h.email, h.lat, h.lng]
    );
  }

  console.log('[Seed] Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    // Governance officer
    { id: 1, username: 'governance_officer', role: 'GOVERNANCE', hospital_id: null, full_name: 'Dr. V. K. Paul (Public Health Commissioner)', email: 'director.governance@health.gov.in', phone: '9811002233' },
    // Doctors
    { id: 2, username: 'dr_menon', role: 'DOCTOR', hospital_id: 4, full_name: 'Dr. Lakshmi Menon', email: 'lakshmi.menon@keralahealth.gov.in', phone: '9847012345' },
    { id: 3, username: 'dr_sharma', role: 'DOCTOR', hospital_id: 1, full_name: 'Dr. Rajesh Sharma', email: 'rajesh.sharma@aiims.edu', phone: '9811223344' },
    { id: 4, username: 'dr_radhika', role: 'DOCTOR', hospital_id: 2, full_name: 'Dr. Radhika Sundaram', email: 'radhika.s@apollohospitals.com', phone: '9840112233' },
    { id: 5, username: 'dr_deshmukh', role: 'DOCTOR', hospital_id: 3, full_name: 'Dr. Anand Deshmukh', email: 'deshmukh@kem.edu', phone: '9820334455' },
    // Hospital Admins
    { id: 6, username: 'admin_ernakulam', role: 'ADMIN', hospital_id: 4, full_name: 'Admin - GH Ernakulam', email: 'admin@ernakulamgh.org', phone: '9447112233' },
    { id: 7, username: 'admin_apollo', role: 'ADMIN', hospital_id: 2, full_name: 'Admin - Apollo Chennai', email: 'admin.chennai@apollohospitals.com', phone: '9840998877' },
    // Migrant Workers
    { id: 8, username: 'worker_ramesh', role: 'WORKER', hospital_id: null, full_name: 'Ramesh Kumar Mandal', email: 'ramesh.worker@gmail.com', phone: '9876543210' },
    { id: 9, username: 'worker_subir', role: 'WORKER', hospital_id: null, full_name: 'Subir Mondal', email: 'subir.mondal@gmail.com', phone: '9876543211' },
    { id: 10, username: 'worker_rajesh', role: 'WORKER', hospital_id: null, full_name: 'Rajesh Paswan', email: 'rajesh.paswan@gmail.com', phone: '9876543212' },
    { id: 11, username: 'worker_anita', role: 'WORKER', hospital_id: null, full_name: 'Anita Devi', email: 'anita.devi@gmail.com', phone: '9876543213' },
    { id: 12, username: 'worker_muthu', role: 'WORKER', hospital_id: null, full_name: 'Muthukumar Shanmugam', email: 'muthu.kumar@gmail.com', phone: '9876543214' },
  ];

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, username, password_hash, role, hospital_id, full_name, email, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.username, passwordHash, u.role, u.hospital_id, u.full_name, u.email, u.phone]
    );
  }

  console.log('[Seed] Seeding doctors...');
  const doctors = [
    { id: 1, user_id: 2, hospital_id: 4, name: 'Dr. Lakshmi Menon', specialization: 'Pulmonology & General Medicine', qualification: 'MD (Resp. Med), MBBS', registration_no: 'KMC-2012-8842', phone: '9847012345', email: 'lakshmi.menon@keralahealth.gov.in', department: 'Pulmonology' },
    { id: 2, user_id: 3, hospital_id: 1, name: 'Dr. Rajesh Sharma', specialization: 'Orthopedics & Trauma Surgery', qualification: 'MS (Ortho), MBBS', registration_no: 'DMC-2008-1129', phone: '9811223344', email: 'rajesh.sharma@aiims.edu', department: 'Orthopedics' },
    { id: 3, user_id: 4, hospital_id: 2, name: 'Dr. Radhika Sundaram', specialization: 'Cardiology & Internal Medicine', qualification: 'DM (Cardio), MD, MBBS', registration_no: 'TMC-2015-4491', phone: '9840112233', email: 'radhika.s@apollohospitals.com', department: 'Cardiology' },
    { id: 4, user_id: 5, hospital_id: 3, name: 'Dr. Anand Deshmukh', specialization: 'Occupational & Environmental Medicine', qualification: 'MD (Comm. Med), DIH', registration_no: 'MMC-2010-3341', phone: '9820334455', email: 'deshmukh@kem.edu', department: 'Occupational Health' }
  ];

  for (const d of doctors) {
    await pool.query(
      `INSERT INTO doctors (id, user_id, hospital_id, name, specialization, qualification, registration_no, phone, email, department)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.user_id, d.hospital_id, d.name, d.specialization, d.qualification, d.registration_no, d.phone, d.email, d.department]
    );
  }

  console.log('[Seed] Seeding migrant workers...');
  const workers = [
    {
      id: 1,
      user_id: 8,
      umhid: 'IND-MIG-2026-8841',
      full_name: 'Ramesh Kumar Mandal',
      dob: '1992-05-14',
      gender: 'Male',
      blood_group: 'B+',
      phone: '+91 98765 43210',
      state_of_origin: 'Bihar',
      district_of_origin: 'Darbhanga',
      current_state: 'Kerala',
      current_district: 'Ernakulam',
      current_address: 'Labour Camp 4B, Near Vallarpadam Container Road, Kalamassery, Kochi',
      occupation_sector: 'Civil Construction & Tile Masonry',
      employer_or_contractor: 'Apex Infracon Pvt Ltd',
      primary_language: 'hi',
      emergency_contact_name: 'Sunita Mandal',
      emergency_contact_relation: 'Spouse',
      emergency_contact_phone: '+91 98765 43299',
      chronic_conditions: 'Occupational Bronchial Hyperresponsiveness / Dust Allergy',
      allergies: 'Penicillin, Sulfa drugs',
      vaccination_status: 'Fully Vaccinated (COVID-19 3 Doses, Tetanus Toxoid, Hepatitis B)',
      qr_token: 'QR_IND_MIG_2026_8841_SECURE_TOKEN',
    },
    {
      id: 2,
      user_id: 9,
      umhid: 'IND-MIG-2026-9204',
      full_name: 'Subir Mondal',
      dob: '1996-11-20',
      gender: 'Male',
      blood_group: 'O+',
      phone: '+91 98765 43211',
      state_of_origin: 'West Bengal',
      district_of_origin: 'Murshidabad',
      current_state: 'Gujarat',
      current_district: 'Surat',
      current_address: 'GIDC Pandesara Industrial Quarters, Surat',
      occupation_sector: 'Textile Looms & Dyeing Industry',
      employer_or_contractor: 'Shree Mahalakshmi Textiles',
      primary_language: 'bn',
      emergency_contact_name: 'Bimal Mondal',
      emergency_contact_relation: 'Brother',
      emergency_contact_phone: '+91 98765 43298',
      chronic_conditions: 'Mild Hypertension (Stage 1)',
      allergies: 'None Known',
      vaccination_status: 'Fully Vaccinated (COVID-19, Tetanus)',
      qr_token: 'QR_IND_MIG_2026_9204_SECURE_TOKEN',
    },
    {
      id: 3,
      user_id: 10,
      umhid: 'IND-MIG-2026-3392',
      full_name: 'Rajesh Paswan',
      dob: '1988-08-10',
      gender: 'Male',
      blood_group: 'A+',
      phone: '+91 98765 43212',
      state_of_origin: 'Uttar Pradesh',
      district_of_origin: 'Gorakhpur',
      current_state: 'Maharashtra',
      current_district: 'Thane',
      current_address: 'Ghodbunder Road Worker Colony, Thane West',
      occupation_sector: 'Scaffolding & Heavy Rigging',
      employer_or_contractor: 'Metro Line 4 Contractor Hub',
      primary_language: 'hi',
      emergency_contact_name: 'Geeta Paswan',
      emergency_contact_relation: 'Spouse',
      emergency_contact_phone: '+91 98765 43297',
      chronic_conditions: 'Chronic Lumbar Strain (Musculoskeletal)',
      allergies: 'NSAID / Ibuprofen Gastritis',
      vaccination_status: 'Fully Vaccinated',
      qr_token: 'QR_IND_MIG_2026_3392_SECURE_TOKEN',
    },
    {
      id: 4,
      user_id: 11,
      umhid: 'IND-MIG-2026-7715',
      full_name: 'Anita Devi',
      dob: '1995-02-18',
      gender: 'Female',
      blood_group: 'AB+',
      phone: '+91 98765 43213',
      state_of_origin: 'Odisha',
      district_of_origin: 'Mayurbhanj',
      current_state: 'Tamil Nadu',
      current_district: 'Chennai',
      current_address: 'Koyambedu Transit Staff Quarters, Chennai',
      occupation_sector: 'Hospitality & Commercial Sanitation',
      employer_or_contractor: 'CleanFacility Services',
      primary_language: 'te',
      emergency_contact_name: 'Pradip Nayak',
      emergency_contact_relation: 'Father',
      emergency_contact_phone: '+91 98765 43296',
      chronic_conditions: 'Microcytic Anemia (Mild)',
      allergies: 'Chlorine vapor hypersensitivity',
      vaccination_status: 'Fully Vaccinated (COVID-19, Rubella, Tetanus)',
      qr_token: 'QR_IND_MIG_2026_7715_SECURE_TOKEN',
    },
    {
      id: 5,
      user_id: 12,
      umhid: 'IND-MIG-2026-5501',
      full_name: 'Muthukumar Shanmugam',
      dob: '1990-09-05',
      gender: 'Male',
      blood_group: 'O-',
      phone: '+91 98765 43214',
      state_of_origin: 'Tamil Nadu',
      district_of_origin: 'Tirunelveli',
      current_state: 'Kerala',
      current_district: 'Idukki',
      current_address: 'Tea Estate Line Barracks, Munnar',
      occupation_sector: 'Plantation & Agro-processing',
      employer_or_contractor: 'Highland Agri Plantations',
      primary_language: 'ta',
      emergency_contact_name: 'Karpagam M',
      emergency_contact_relation: 'Spouse',
      emergency_contact_phone: '+91 98765 43295',
      chronic_conditions: 'Type 2 Diabetes Mellitus',
      allergies: 'Organophosphate mild sensitivity',
      vaccination_status: 'Fully Vaccinated',
      qr_token: 'QR_IND_MIG_2026_5501_SECURE_TOKEN',
    }
  ];

  for (const w of workers) {
    await pool.query(
      `INSERT INTO migrant_workers (id, user_id, umhid, full_name, dob, gender, blood_group, phone,
        state_of_origin, district_of_origin, current_state, current_district, current_address,
        occupation_sector, employer_or_contractor, primary_language, emergency_contact_name,
        emergency_contact_relation, emergency_contact_phone, chronic_conditions, allergies,
        vaccination_status, qr_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        w.id, w.user_id, w.umhid, w.full_name, w.dob, w.gender, w.blood_group, w.phone,
        w.state_of_origin, w.district_of_origin, w.current_state, w.current_district, w.current_address,
        w.occupation_sector, w.employer_or_contractor, w.primary_language, w.emergency_contact_name,
        w.emergency_contact_relation, w.emergency_contact_phone, w.chronic_conditions, w.allergies,
        w.vaccination_status, w.qr_token
      ]
    );
  }

  console.log('[Seed] Seeding longitudinal cross-hospital encounters...');
  const encounters = [
    // Ramesh's record 1: 2024 in West Bengal (Burdwan)
    {
      id: 1,
      migrant_worker_id: 1,
      hospital_id: 5,
      doctor_id: 4,
      encounter_date: '2024-06-12 11:30:00',
      encounter_type: 'OPD',
      chief_complaint: 'Persistent dry cough for 3 weeks, mild wheezing on exertion after stone crushing work.',
      vitals_bp: '122/80 mmHg',
      vitals_pulse: '76 bpm',
      vitals_spo2: '98%',
      vitals_temp: '98.4 F',
      vitals_weight: '64 kg',
      diagnosis: 'Occupational Dust-Induced Bronchospasm & Early Silicosis Suspicion',
      icd10_code: 'J62.8',
      occupational_hazard_flag: 'Silicosis/Dust',
      treatment_plan: 'Inhaled Budesonide/Formoterol, strict N95 respirator advisory at work sites.',
      clinical_notes: 'Bilateral mild expiratory wheeze. Advised chest radiograph and cessation of dry grinding without mist suppression.'
    },
    // Ramesh's record 2: 2025 in AIIMS Delhi
    {
      id: 2,
      migrant_worker_id: 1,
      hospital_id: 1,
      doctor_id: 2,
      encounter_date: '2025-02-18 14:15:00',
      encounter_type: 'Emergency',
      chief_complaint: 'Trauma & severe right forearm pain following fall from 2-meter scaffolding on site.',
      vitals_bp: '134/86 mmHg',
      vitals_pulse: '88 bpm',
      vitals_spo2: '99%',
      vitals_temp: '98.6 F',
      vitals_weight: '65 kg',
      diagnosis: 'Closed Distal Radius Fracture (Colles Type), Right Forearm',
      icd10_code: 'S52.5',
      occupational_hazard_flag: 'Ergonomic/Musculoskeletal',
      treatment_plan: 'Closed reduction under hematoma block, above-elbow POP cast application for 4 weeks. Analgesics.',
      clinical_notes: 'Neurovascular status intact post cast application. Check X-ray shows anatomical reduction. Cast care instructions given in Hindi.'
    },
    // Ramesh's record 3: 2026 in Ernakulam Kerala (Current Location)
    {
      id: 3,
      migrant_worker_id: 1,
      hospital_id: 4,
      doctor_id: 1,
      encounter_date: '2026-08-20 10:00:00',
      encounter_type: 'OPD',
      chief_complaint: 'Exacerbation of cough with nocturnal breathlessness and chest tightness during monsoon humidity.',
      vitals_bp: '128/82 mmHg',
      vitals_pulse: '82 bpm',
      vitals_spo2: '96%',
      vitals_temp: '98.8 F',
      vitals_weight: '66 kg',
      diagnosis: 'Moderate Persistent Asthma with Occupational Dust Sensitization',
      icd10_code: 'J45.40',
      occupational_hazard_flag: 'Silicosis/Dust',
      treatment_plan: 'DPI Formoterol + Fluticasone 250mcg twice daily, Oral Montelukast 10mg nocte. Peak flow monitoring.',
      clinical_notes: 'Patient accessed via Universal Migrant Health ID. Prior Delhi and Burdwan records reviewed smoothly via federated consent. Right wrist full range restored.'
    },
    // Subir Mondal in Surat (Textile Worker)
    {
      id: 4,
      migrant_worker_id: 2,
      hospital_id: 6,
      doctor_id: 4,
      encounter_date: '2026-07-14 09:30:00',
      encounter_type: 'Occupational Checkup',
      chief_complaint: 'Routine industrial screening, eye redness and chemical fumes exposure at textile dye vat.',
      vitals_bp: '138/88 mmHg',
      vitals_pulse: '74 bpm',
      vitals_spo2: '98%',
      vitals_temp: '98.2 F',
      vitals_weight: '58 kg',
      diagnosis: 'Chemical Conjunctivitis & Stage-1 Hypertension',
      icd10_code: 'H10.89',
      occupational_hazard_flag: 'Pesticide/Chemical',
      treatment_plan: 'Carboxymethylcellulose lubricating eye drops, Olopatadine 0.1% drops. Dietary sodium restriction.',
      clinical_notes: 'Occupational safety audit logged for employer. Advised mandatory safety goggles during vat pigment loading.'
    },
    // Rajesh Paswan in KEM Mumbai
    {
      id: 5,
      migrant_worker_id: 3,
      hospital_id: 3,
      doctor_id: 4,
      encounter_date: '2026-08-05 16:20:00',
      encounter_type: 'OPD',
      chief_complaint: 'Severe lower back pain radiating to left gluteal region after lifting 50kg cement sacks.',
      vitals_bp: '130/84 mmHg',
      vitals_pulse: '80 bpm',
      vitals_spo2: '99%',
      vitals_temp: '98.6 F',
      vitals_weight: '72 kg',
      diagnosis: 'Acute Lumbar Disc Strain (L4-L5 radiculopathy pending MRI)',
      icd10_code: 'M54.5',
      occupational_hazard_flag: 'Ergonomic/Musculoskeletal',
      treatment_plan: 'Thiocolchicoside + Paracetamol, physical therapy, lumbar support belt, lifting restriction < 15kg.',
      clinical_notes: 'SLR test positive at 60 degrees on left. Advised 5 days bed rest and ergonomic training.'
    }
  ];

  for (const e of encounters) {
    await pool.query(
      `INSERT INTO encounters (id, migrant_worker_id, hospital_id, doctor_id, encounter_date, encounter_type,
        chief_complaint, vitals_bp, vitals_pulse, vitals_spo2, vitals_temp, vitals_weight, diagnosis,
        icd10_code, occupational_hazard_flag, treatment_plan, clinical_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        e.id, e.migrant_worker_id, e.hospital_id, e.doctor_id, e.encounter_date, e.encounter_type,
        e.chief_complaint, e.vitals_bp, e.vitals_pulse, e.vitals_spo2, e.vitals_temp, e.vitals_weight,
        e.diagnosis, e.icd10_code, e.occupational_hazard_flag, e.treatment_plan, e.clinical_notes
      ]
    );
  }

  console.log('[Seed] Seeding prescriptions...');
  const prescriptions = [
    { encounter_id: 1, medicine_name: 'Budesonide Inhaler 200mcg', dosage: '2 puffs', frequency: 'Twice daily', timing: 'After Food', duration_days: 30, instructions: 'Rinse mouth with water thoroughly after inhalation' },
    { encounter_id: 1, medicine_name: 'Levocetirizine 5mg', dosage: '1 tablet', frequency: 'Once daily', timing: 'Bedtime', duration_days: 15, instructions: 'Take at night; may cause slight drowsiness' },
    
    { encounter_id: 2, medicine_name: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'Three times daily', timing: 'After Food', duration_days: 7, instructions: 'Take after meals for pain relief' },
    { encounter_id: 2, medicine_name: 'Calcium Carbonate + Vitamin D3', dosage: '1 tablet', frequency: 'Once daily', timing: 'After Food', duration_days: 60, instructions: 'Promotes bone union and strength' },
    
    { encounter_id: 3, medicine_name: 'Formoterol 6mcg + Fluticasone 250mcg DPI', dosage: '1 rotacap', frequency: 'Twice daily', timing: 'After Food', duration_days: 60, instructions: 'Inhale via Rotahaler morning and night' },
    { encounter_id: 3, medicine_name: 'Montelukast 10mg', dosage: '1 tablet', frequency: 'Once daily', timing: 'Bedtime', duration_days: 30, instructions: 'Anti-allergy maintenance at bedtime' },
    { encounter_id: 3, medicine_name: 'Salbutamol 100mcg Inhaler', dosage: '2 puffs', frequency: 'SOS (As needed)', timing: 'Before Food', duration_days: 90, instructions: 'Emergency rescue inhaler for sudden breathlessness' },

    { encounter_id: 4, medicine_name: 'Carboxymethylcellulose 0.5% Drops', dosage: '1 drop in both eyes', frequency: '4 times daily', timing: 'After Food', duration_days: 14, instructions: 'Instill in both eyes regularly' },
    { encounter_id: 4, medicine_name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily (Morning)', timing: 'After Food', duration_days: 30, instructions: 'BP management; check pressure weekly' },

    { encounter_id: 5, medicine_name: 'Thiocolchicoside 4mg + Paracetamol 325mg', dosage: '1 tablet', frequency: 'Twice daily', timing: 'After Food', duration_days: 7, instructions: 'Muscle relaxant; avoid operating heavy cranes while on medication' }
  ];

  for (const p of prescriptions) {
    await pool.query(
      `INSERT INTO prescriptions (encounter_id, medicine_name, dosage, frequency, timing, duration_days, instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.encounter_id, p.medicine_name, p.dosage, p.frequency, p.timing, p.duration_days, p.instructions]
    );
  }

  console.log('[Seed] Seeding lab reports...');
  const labReports = [
    { encounter_id: 1, test_name: 'Spirometry (PFT)', category: 'Pulmonary', result_value: 'FEV1/FVC: 72% (Mild Obstruction)', reference_range: '> 75%', unit: '%', status: 'Abnormal', test_date: '2024-06-12', lab_technician: 'A. Ghosh', notes: 'Reversible bronchoconstriction noted post-bronchodilator (+14%)' },
    { encounter_id: 2, test_name: 'Digital X-Ray Right Forearm AP/Lat', category: 'Radiology', result_value: 'Extra-articular transverse fracture distal radius with 15 deg dorsal tilt', reference_range: 'Normal bony alignment', unit: 'N/A', status: 'Abnormal', test_date: '2025-02-18', lab_technician: 'S. Rawat', notes: 'Post-reduction film confirms anatomical alignment' },
    { encounter_id: 3, test_name: 'Serum Total IgE & Absolute Eosinophil Count (AEC)', category: 'Biochemistry / Immunology', result_value: 'IgE: 420 IU/mL, AEC: 650 cells/uL', reference_range: 'IgE < 100, AEC < 450', unit: 'IU/mL', status: 'Abnormal', test_date: '2026-08-20', lab_technician: 'K. Varma', notes: 'Consistent with allergic airway sensitization' },
    { encounter_id: 3, test_name: 'Complete Blood Count (CBC)', category: 'Hematology', result_value: 'Hb: 13.8, TLC: 7400, Platelets: 240,000', reference_range: 'Hb 13.0-17.0', unit: 'g/dL', status: 'Normal', test_date: '2026-08-20', lab_technician: 'K. Varma', notes: 'Normal cell counts' },
    { encounter_id: 4, test_name: 'Fasting Blood Glucose', category: 'Biochemistry', result_value: '94 mg/dL', reference_range: '70 - 100', unit: 'mg/dL', status: 'Normal', test_date: '2026-07-14', lab_technician: 'D. Patel', notes: 'Euglycemic profile' }
  ];

  for (const l of labReports) {
    await pool.query(
      `INSERT INTO lab_reports (encounter_id, test_name, category, result_value, reference_range, unit, status, test_date, lab_technician, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [l.encounter_id, l.test_name, l.category, l.result_value, l.reference_range, l.unit, l.status, l.test_date, l.lab_technician, l.notes]
    );
  }

  console.log('[Seed] Seeding appointments...');
  const appointments = [
    { migrant_worker_id: 1, hospital_id: 4, doctor_id: 1, department: 'Pulmonology', appointment_date: '2026-09-05', time_slot: '10:30 AM - 11:00 AM', token_number: 14, status: 'Scheduled', symptoms_summary: 'Monthly follow-up for inhaler adjustment and peak flow check' },
    { migrant_worker_id: 2, hospital_id: 6, doctor_id: 4, department: 'Occupational Health', appointment_date: '2026-09-02', time_slot: '11:15 AM - 11:45 AM', token_number: 8, status: 'Scheduled', symptoms_summary: 'Eye check-up post chemical exposure' },
    { migrant_worker_id: 3, hospital_id: 3, doctor_id: 4, department: 'Orthopedics & Spine', appointment_date: '2026-08-30', time_slot: '02:00 PM - 02:30 PM', token_number: 22, status: 'Completed', symptoms_summary: 'Lumbar physio evaluation' }
  ];

  for (const a of appointments) {
    await pool.query(
      `INSERT INTO appointments (migrant_worker_id, hospital_id, doctor_id, department, appointment_date, time_slot, token_number, status, symptoms_summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.migrant_worker_id, a.hospital_id, a.doctor_id, a.department, a.appointment_date, a.time_slot, a.token_number, a.status, a.symptoms_summary]
    );
  }

  console.log('[Seed] Seeding epidemiological disease surveillance events...');
  const outbreaks = [
    {
      disease_name: 'Dengue Fever Outbreak',
      disease_category: 'Vector-borne',
      district: 'Ernakulam',
      state: 'Kerala',
      lat: 10.0261,
      lng: 76.3125,
      cluster_name: 'Perumbavoor Migrant Industrial Colony Hub',
      active_cases: 48,
      severity_level: 'High',
      migrant_workforce_exposure: 3200,
      recommended_intervention: 'Immediate fogging, source reduction of stagnant water, distribution of free mosquito nets, mobile fever screening camp.',
      reported_date: '2026-08-25',
      status: 'Active'
    },
    {
      disease_name: 'Occupational Silicosis & Dust Bronchitis Cluster',
      disease_category: 'Occupational',
      district: 'Surat',
      state: 'Gujarat',
      lat: 21.2330,
      lng: 72.8634,
      cluster_name: 'Katargam - Pandesara Industrial Masonry Zone',
      active_cases: 34,
      severity_level: 'Critical',
      migrant_workforce_exposure: 4500,
      recommended_intervention: 'Mandatory wet-cutting protocols, enforcement of automated dust scrubbers, free high-resolution CT screening for textile/stone workers.',
      reported_date: '2026-08-18',
      status: 'Active'
    },
    {
      disease_name: 'Acute Waterborne Gastroenteritis',
      disease_category: 'Water-borne',
      district: 'Thane',
      state: 'Maharashtra',
      lat: 19.2183,
      lng: 72.9781,
      cluster_name: 'Bhiwandi Logistic Worker Settlement',
      active_cases: 62,
      severity_level: 'High',
      migrant_workforce_exposure: 2800,
      recommended_intervention: 'Chlorination of community tube-wells, distribution of ORS packets, piped safe drinking water tankers deployed.',
      reported_date: '2026-08-27',
      status: 'Active'
    },
    {
      disease_name: 'Severe Heat Stress & Dehydration Incidents',
      disease_category: 'Occupational',
      district: 'Hyderabad',
      state: 'Telangana',
      lat: 17.3850,
      lng: 78.4867,
      cluster_name: 'Financial District High-Rise Construction Zone',
      active_cases: 29,
      severity_level: 'Moderate',
      migrant_workforce_exposure: 5100,
      recommended_intervention: 'Mandatory 12 PM - 3 PM afternoon work pause during heatwaves, electrolyte replenishment stations at all construction sites.',
      reported_date: '2026-08-22',
      status: 'Monitoring'
    },
    {
      disease_name: 'Viral Upper Respiratory Tract Infection Spike',
      disease_category: 'Respiratory',
      district: 'New Delhi',
      state: 'Delhi',
      lat: 28.6139,
      lng: 77.2090,
      cluster_name: 'Anand Vihar Interstate Transit Worker Camp',
      active_cases: 85,
      severity_level: 'Moderate',
      migrant_workforce_exposure: 6000,
      recommended_intervention: 'Flu vaccination drive, free mask distribution, symptomatic triage at transit dispensaries.',
      reported_date: '2026-08-28',
      status: 'Active'
    },
    {
      disease_name: 'Chikungunya Cluster',
      disease_category: 'Vector-borne',
      district: 'Kanchipuram',
      state: 'Tamil Nadu',
      lat: 12.9810,
      lng: 79.9725,
      cluster_name: 'Sriperumbudur Auto Manufacturing Corridor',
      active_cases: 19,
      severity_level: 'Moderate',
      migrant_workforce_exposure: 1800,
      recommended_intervention: 'Vector larval density control, door-to-door joint pain and fever surveillance.',
      reported_date: '2026-08-15',
      status: 'Contained'
    }
  ];

  for (const o of outbreaks) {
    await pool.query(
      `INSERT INTO disease_surveillance_events (disease_name, disease_category, district, state, lat, lng,
        cluster_name, active_cases, severity_level, migrant_workforce_exposure, recommended_intervention,
        reported_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.disease_name, o.disease_category, o.district, o.state, o.lat, o.lng,
        o.cluster_name, o.active_cases, o.severity_level, o.migrant_workforce_exposure,
        o.recommended_intervention, o.reported_date, o.status
      ]
    );
  }

  console.log('[Seed] Seeding audit logs...');
  const auditLogs = [
    { migrant_worker_id: 1, accessor_user_id: 2, hospital_id: 4, action: 'FEDERATED_RECORD_ACCESS', resource_type: 'EHR_FULL_TIMELINE', details: 'Doctor Lakshmi Menon accessed longitudinal record from AIIMS Delhi & Burdwan under OTP Consent #7729' },
    { migrant_worker_id: 1, accessor_user_id: 3, hospital_id: 1, action: 'EMERGENCY_SOS_QR_SCAN', resource_type: 'EMERGENCY_VITALS', details: 'Emergency Trauma Triage Officer scanned UMHID QR badge' },
    { migrant_worker_id: 2, accessor_user_id: 5, hospital_id: 6, action: 'OCCUPATIONAL_SURVEILLANCE_REPORT', resource_type: 'LAB_REPORTS', details: 'Occupational medical officer logged chemical eye test report' }
  ];

  for (const a of auditLogs) {
    await pool.query(
      `INSERT INTO access_audit_logs (migrant_worker_id, accessor_user_id, hospital_id, action, resource_type, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [a.migrant_worker_id, a.accessor_user_id, a.hospital_id, a.action, a.resource_type, a.details]
    );
  }

  console.log('[Seed] Database successfully seeded with rich realistic migrant health dataset!');
}

// Run directly if invoked from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
