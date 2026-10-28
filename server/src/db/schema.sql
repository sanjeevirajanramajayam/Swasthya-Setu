-- SWASTHYA SETU - Migrant Health Interoperability Database Schema

CREATE TABLE IF NOT EXISTS hospitals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  hospital_type VARCHAR(100) DEFAULT 'General Hospital',
  tier VARCHAR(50) DEFAULT 'Tertiary',
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('WORKER', 'DOCTOR', 'ADMIN', 'GOVERNANCE') NOT NULL,
  hospital_id INT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS migrant_workers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NULL,
  umhid VARCHAR(64) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  blood_group VARCHAR(10) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  state_of_origin VARCHAR(100) NOT NULL,
  district_of_origin VARCHAR(100),
  current_state VARCHAR(100) NOT NULL,
  current_district VARCHAR(100),
  current_address TEXT,
  occupation_sector VARCHAR(100) NOT NULL,
  employer_or_contractor VARCHAR(255),
  primary_language VARCHAR(50) DEFAULT 'hi',
  emergency_contact_name VARCHAR(255) NOT NULL,
  emergency_contact_relation VARCHAR(100) NOT NULL,
  emergency_contact_phone VARCHAR(20) NOT NULL,
  chronic_conditions TEXT,
  allergies TEXT,
  vaccination_status VARCHAR(100) DEFAULT 'Fully Vaccinated',
  qr_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NULL,
  hospital_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  qualification VARCHAR(100) NOT NULL,
  registration_no VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS encounters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migrant_worker_id INT NOT NULL,
  hospital_id INT NOT NULL,
  doctor_id INT NOT NULL,
  encounter_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  encounter_type ENUM('OPD', 'Emergency', 'Occupational Checkup', 'Follow-up', 'Inpatient') DEFAULT 'OPD',
  chief_complaint TEXT NOT NULL,
  vitals_bp VARCHAR(20),
  vitals_pulse VARCHAR(20),
  vitals_spo2 VARCHAR(20),
  vitals_temp VARCHAR(20),
  vitals_weight VARCHAR(20),
  diagnosis TEXT NOT NULL,
  icd10_code VARCHAR(50),
  occupational_hazard_flag ENUM('None', 'Silicosis/Dust', 'Pesticide/Chemical', 'Heat Stress', 'Ergonomic/Musculoskeletal', 'Noise/Vibration') DEFAULT 'None',
  treatment_plan TEXT,
  clinical_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (migrant_worker_id) REFERENCES migrant_workers(id) ON DELETE CASCADE,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  encounter_id INT NOT NULL,
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  timing ENUM('Before Food', 'After Food', 'With Food', 'Bedtime') DEFAULT 'After Food',
  duration_days INT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encounter_id) REFERENCES encounters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lab_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  encounter_id INT NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'Biochemistry',
  result_value VARCHAR(255) NOT NULL,
  reference_range VARCHAR(100),
  unit VARCHAR(50),
  status ENUM('Normal', 'Abnormal', 'Critical') DEFAULT 'Normal',
  test_date DATE DEFAULT (CURRENT_DATE),
  lab_technician VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encounter_id) REFERENCES encounters(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migrant_worker_id INT NOT NULL,
  hospital_id INT NOT NULL,
  doctor_id INT NULL,
  department VARCHAR(100) NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  token_number INT NOT NULL,
  status ENUM('Scheduled', 'In-Consultation', 'Completed', 'Cancelled', 'No-Show') DEFAULT 'Scheduled',
  symptoms_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (migrant_worker_id) REFERENCES migrant_workers(id) ON DELETE CASCADE,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS consent_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migrant_worker_id INT NOT NULL,
  requesting_doctor_id INT NOT NULL,
  requesting_hospital_id INT NOT NULL,
  status ENUM('Pending', 'Approved', 'Denied', 'Expired') DEFAULT 'Pending',
  otp_code VARCHAR(10) NOT NULL,
  purpose VARCHAR(255) DEFAULT 'Cross-Hospital Medical Record Evaluation',
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  granted_at DATETIME NULL,
  expires_at DATETIME NULL,
  FOREIGN KEY (migrant_worker_id) REFERENCES migrant_workers(id) ON DELETE CASCADE,
  FOREIGN KEY (requesting_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (requesting_hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS access_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migrant_worker_id INT NOT NULL,
  accessor_user_id INT NULL,
  hospital_id INT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50) DEFAULT '127.0.0.1',
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (migrant_worker_id) REFERENCES migrant_workers(id) ON DELETE CASCADE,
  FOREIGN KEY (accessor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS disease_surveillance_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  disease_name VARCHAR(100) NOT NULL,
  disease_category ENUM('Vector-borne', 'Water-borne', 'Respiratory', 'Occupational', 'Zoonotic', 'Viral') NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  cluster_name VARCHAR(255) NOT NULL,
  active_cases INT NOT NULL,
  severity_level ENUM('Low', 'Moderate', 'High', 'Critical') DEFAULT 'Moderate',
  migrant_workforce_exposure INT DEFAULT 0,
  recommended_intervention TEXT,
  reported_date DATE NOT NULL,
  status ENUM('Active', 'Contained', 'Monitoring') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
