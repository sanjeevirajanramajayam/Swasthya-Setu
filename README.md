# SWASTHYA SETU (स्वास्थ्य सेतु)
### Scalable Interoperable Digital Health Record & Governance Platform for Migrant Workers

A full-stack, cloud-ready healthcare platform bridging clinical interoperability, portable electronic health records (FHIR R4 compliant), appointment management, and public health governance across inter-state hospital networks for migrant laborers.

---

## 🌟 Key Features

- **Portable Digital Health Records (UMHID & QR Badges)**: Universal Migrant Health ID (UMHID) with cryptographically verifiable offline-capable QR health pass.
- **Federated Longitudinal EHR**: Seamless chronological health history across state borders (PHCs, district hospitals, tertiary apex medical centers).
- **Consent-Driven Access**: Time-bound, OTP-secured consent workflows compliant with ABDM / NDHM standards.
- **AI Triage & Network Referral**: Intelligent clinical urgency scoring, ICU/bed capacity routing, and instant inter-hospital referrals.
- **Disease Surveillance & Governance**: Real-time syndromic outbreak geospatial mapping, industrial cluster alerts, and immutable SHA-256 access audit trails.
- **Multi-Role Portals**: Dedicated workspaces for Migrant Workers, Clinicians/Doctors, Hospital Admins, and Public Health Governance Officers.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js, Leaflet / React-Leaflet, html5-qrcode
- **Backend**: Node.js, Express (ES Modules), JWT Authentication, CORS
- **Database**: MySQL 8.0 (Relational schema with migrations and rich seed data)
- **Standards**: FHIR R4 Compliant Data Models, ICD-11 coding schema

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)

### 2. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your MySQL credentials (DB_USER, DB_PASSWORD, DB_NAME)
npm install
npm run seed     # Migrates schema and populates sample clinical datasets
npm run dev      # Starts Express API at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev      # Starts Vite dev server at http://localhost:5173
```

---

## 👥 Demo Credentials & Switcher

The application comes with built-in instant role switching for evaluation:

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Worker** | `worker_ramesh` | `1234` | Civil construction worker in Kerala |
| **Doctor** | `dr_menon` | `1234` | Pulmonologist at General Hospital Ernakulam |
| **Governance** | `governance_officer` | `1234` | National public health commissioner |
| **Admin** | `admin_ernakulam` | `1234` | Hospital facility admin |

---

## 📊 Documentation & Figures
Interactive dashboard figures and architectural diagrams can be previewed in [FIGURES.md](./FIGURES.md) and [figures/dashboard_figures_viewer.html](./figures/dashboard_figures_viewer.html).
