import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import InteractiveHealthMap from '../Common/InteractiveHealthMap';
import {
  Building2,
  Stethoscope,
  Users,
  Calendar,
  Plus,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  X,
  Phone,
  Mail,
  LayoutGrid,
  Map
} from 'lucide-react';

export default function HospitalAdminDashboard() {
  const { user, t } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'map'

  // New Doctor form
  const [docName, setDocName] = useState('');
  const [specialization, setSpecialization] = useState('Pulmonology');
  const [qualification, setQualification] = useState('MD, MBBS');
  const [regNo, setRegNo] = useState(`KMC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [phone, setPhone] = useState('9847001122');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Pulmonology');
  const [submittingDoc, setSubmittingDoc] = useState(false);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hospitals');
      const data = await res.json();
      if (data.success && data.hospitals.length > 0) {
        setHospitals(data.hospitals);
        const current = data.hospitals.find(h => h.id === (user?.hospital_id || 4)) || data.hospitals[0];
        setSelectedHospital(current);
        loadHospitalDetails(current.id);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHospitalDetails = async (id) => {
    try {
      const res = await fetch(`/api/hospitals/${id}`);
      const data = await res.json();
      if (data.success) {
        setHospitalDetails(data);
      }
    } catch (err) {
      console.error('Error fetching hospital details:', err);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, [user]);

  const handleSelectHospital = (h) => {
    setSelectedHospital(h);
    loadHospitalDetails(h.id);
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!selectedHospital) return;
    setSubmittingDoc(true);
    try {
      const res = await fetch(`/api/hospitals/${selectedHospital.id}/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: docName,
          specialization,
          qualification,
          registration_no: regNo,
          phone,
          email: email || `${docName.toLowerCase().replace(/\s+/g, '')}@hospital.org`,
          department,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddDoctorOpen(false);
        setDocName('');
        loadHospitalDetails(selectedHospital.id);
      }
    } catch (err) {
      console.error('Error adding doctor:', err);
    } finally {
      setSubmittingDoc(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner (Govt Style) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-xl bg-[#003366] dark:bg-gradient-to-r dark:from-amber-950/80 dark:via-slate-900 dark:to-slate-900 text-white border-b-2 border-[#e65100] dark:border-amber-500/30 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-white/10 dark:bg-amber-600/30 border border-white/20 dark:border-amber-500/50 flex items-center justify-center text-white dark:text-amber-300 shadow-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-serif">Hospital Network Administration</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e65100] text-white dark:bg-amber-500/20 dark:text-amber-300">
                MULTI-FACILITY FEDERATION
              </span>
            </div>
            <p className="text-xs text-slate-200 dark:text-slate-400 mt-0.5 font-medium">
              National Health Authority Hospital Network Registry • Clinical Roster & OPD Slots
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddDoctorOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#e65100] hover:bg-[#d84315] text-white text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Doctor</span>
        </button>
      </div>

      {/* Facilities Grid & Map View Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-base font-black text-[#003366] dark:text-white font-serif flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#003366] dark:text-amber-400" />
            <span>Participating Hospital Network Nodes</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {viewMode === 'map'
              ? 'Geospatial facility locator — click any facility pin on the map to inspect OPD roster'
              : 'Select a participating hospital facility to inspect and manage clinical rosters & queue'}
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-300 dark:border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
              viewMode === 'cards'
                ? 'bg-[#003366] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Facility Cards</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
              viewMode === 'map'
                ? 'bg-[#003366] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Conditional: Map View vs Cards Grid */}
      {viewMode === 'map' ? (
        <div className="space-y-2">
          <InteractiveHealthMap
            hospitals={hospitals}
            outbreaks={[]}
            onSelectHospital={handleSelectHospital}
          />
          <div className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium italic">
            Currently selected: <strong className="text-[#003366] dark:text-sky-400">{selectedHospital?.name}</strong> ({selectedHospital?.district}, {selectedHospital?.state})
          </div>
        </div>
      ) : (
        /* Network Facilities Selector Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.map((h) => (
            <div
              key={h.id}
              onClick={() => handleSelectHospital(h)}
              className={`p-5 rounded-xl border-2 cursor-pointer transition shadow-sm ${
                selectedHospital?.id === h.id
                  ? 'bg-blue-50 border-[#003366] dark:bg-amber-950/40 dark:border-amber-500/60'
                  : 'bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-[#003366] border border-slate-300 dark:bg-slate-800 dark:text-slate-300">
                    {h.code}
                  </span>
                  <h4 className="text-base font-black text-[#003366] dark:text-white mt-1.5 font-serif">{h.name}</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300">
                  Active Node
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#003366] dark:text-teal-400 shrink-0" />
                <span>{h.district}, {h.state} ({h.tier})</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">Doctors</span>
                  <span className="font-bold text-slate-900 dark:text-white">{h.doctorCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">Encounters</span>
                  <span className="font-bold text-[#003366] dark:text-sky-400">{h.encounterCount}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">Active Queue</span>
                  <span className="font-bold text-[#e65100] dark:text-amber-400">{h.activeAppointments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Hospital Detailed Roster */}
      {selectedHospital && hospitalDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Doctor Roster (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#003366] dark:text-white flex items-center gap-2 font-serif">
                  <Stethoscope className="w-5 h-5 text-[#003366] dark:text-amber-400" />
                  <span>Authorized Clinical Roster — {selectedHospital.name}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Doctors authorized to access cross-hospital federated EHR</p>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300">
                {hospitalDetails.doctors?.length || 0} Doctors
              </span>
            </div>

            <div className="space-y-3">
              {hospitalDetails.doctors?.map((doc) => (
                <div key={doc.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{doc.name}</div>
                      <div className="text-slate-600 dark:text-slate-400 mt-0.5">{doc.specialization} ({doc.qualification})</div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-white dark:bg-slate-900 text-[#003366] dark:text-emerald-400 border border-slate-300 dark:border-slate-700">
                      Reg: {doc.registration_no}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      Dept: {doc.department || 'General Medicine'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {doc.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {doc.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Encounters in this Hospital (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-[#003366] dark:text-white flex items-center gap-2 font-serif">
                <Calendar className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                <span>Recent Consultations at Facility</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Recent migrant worker visits</p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {hospitalDetails.recentEncounters?.map((e) => (
                <div key={e.id} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{e.worker_name}</span>
                    <span className="font-mono text-[10px] text-[#003366] dark:text-emerald-400 font-bold">{e.worker_umhid}</span>
                  </div>
                  <div className="text-slate-800 dark:text-slate-300 font-semibold">{e.diagnosis}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800/60">
                    <span>Dr. {e.doctor_name}</span>
                    <span>{new Date(e.encounter_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Onboard Doctor Modal */}
      {isAddDoctorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border-2 border-[#003366] dark:border-amber-500/40 p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-md bg-[#003366] dark:bg-amber-500/20 text-white dark:text-amber-400 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#003366] dark:text-white font-serif">Onboard Doctor</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">To {selectedHospital?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDoctorOpen(false)}
                className="p-1.5 rounded text-slate-500 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Doctor Name:</label>
                <input
                  type="text"
                  placeholder="Dr. Rajesh Kumar"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Specialization:</label>
                <input
                  type="text"
                  placeholder="E.g. Pulmonology / Occupational Medicine"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Medical Registration No:</label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department:</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorOpen(false)}
                  className="px-4 py-2 rounded bg-slate-200 text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDoc}
                  className="px-6 py-2 rounded bg-[#003366] hover:bg-[#002244] text-white font-bold transition"
                >
                  {submittingDoc ? 'Adding...' : 'Onboard Doctor'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
