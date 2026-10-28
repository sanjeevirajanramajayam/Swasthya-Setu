import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MedicalTimeline from '../WorkerPortal/MedicalTimeline';
import QRScannerModal from './QRScannerModal';
import NewConsultationModal from './NewConsultationModal';
import ConsentGrantModal from './ConsentGrantModal';
import {
  Search,
  QrCode,
  Stethoscope,
  Building2,
  Lock,
  Unlock,
  PlusCircle,
  Clock,
  UserCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function DoctorDashboard({ onOpenFHIR }) {
  const { user, t } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [workersList, setWorkersList] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [appointmentsQueue, setAppointmentsQueue] = useState([]);
  const [isConsentUnlocked, setIsConsentUnlocked] = useState(true);

  // Modals
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch initial list of workers & appointments
  const loadData = async () => {
    try {
      setLoading(true);
      const [wRes, aRes] = await Promise.all([
        fetch('/api/workers'),
        fetch(`/api/appointments?hospitalId=${user?.hospital_id || 4}`)
      ]);
      const wData = await wRes.json();
      const aData = await aRes.json();

      if (wData.success) {
        setWorkersList(wData.workers);
        if (wData.workers.length > 0 && !selectedWorker) {
          selectWorker(wData.workers[0].umhid);
        }
      }
      if (aData.success) {
        setAppointmentsQueue(aData.appointments);
      }
    } catch (err) {
      console.error('Doctor data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Select patient and fetch full longitudinal medical history
  const selectWorker = async (identifier) => {
    try {
      setLoading(true);
      const [lookupRes, historyRes] = await Promise.all([
        fetch(`/api/workers/lookup/${identifier}`),
        fetch(`/api/workers/${identifier}/longitudinal-history`)
      ]);

      const lookupData = await lookupRes.json();
      const historyData = await historyRes.json();

      if (lookupData.success) {
        setSelectedWorker(lookupData.worker);
      }
      if (historyData.success) {
        setMedicalHistory(historyData);
      }
    } catch (err) {
      console.error('Error selecting worker:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      selectWorker(searchQuery.trim());
    }
  };

  const handleQRScanSuccess = (umhid) => {
    setSearchQuery(umhid);
    selectWorker(umhid);
  };

  return (
    <div className="space-y-6">
      
      {/* Doctor Header Banner (Govt Style) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-xl bg-[#003366] dark:bg-gradient-to-r dark:from-sky-950/80 dark:via-slate-900 dark:to-slate-900 text-white border-b-2 border-[#e65100] dark:border-sky-500/30 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-white/10 dark:bg-sky-600/30 border border-white/20 dark:border-sky-500/50 flex items-center justify-center text-white dark:text-sky-300 shadow-sm">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-serif">{user?.full_name || 'Dr. Lakshmi Menon'}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e65100] text-white dark:bg-sky-500/20 dark:text-sky-300">
                CLINICAL PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-200 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-amber-300 dark:text-sky-400" />
              <span>{user?.hospital_name || 'General Hospital Ernakulam, Kerala'}</span>
              <span>•</span>
              <span className="text-amber-200 dark:text-sky-300">{user?.doctorProfile?.specialization || 'Pulmonology & General Medicine'}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#e65100] hover:bg-[#d84315] text-white text-xs font-bold shadow-sm transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Patient QR Pass</span>
          </button>
          
          <button
            onClick={loadData}
            className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs transition border border-white/20"
            title="Refresh patient roster"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column Patient Queue/Search, Right Column Longitudinal EHR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Patient Selector & Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Patient Search */}
          <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
            <div className="text-xs font-bold text-[#003366] dark:text-slate-300 uppercase tracking-wider">
              Search Patient (UMHID / Phone)
            </div>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="E.g. IND-MIG-2026-8841"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-md bg-[#003366] dark:bg-sky-600 hover:bg-[#002244] text-white text-xs font-bold transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Today's Triage & Appointment Queue */}
          <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#003366] dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#e65100] dark:text-amber-400" />
                <span>Today's OPD Queue</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300">
                {appointmentsQueue.length} Active
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {appointmentsQueue.map((a) => (
                <div
                  key={a.id}
                  onClick={() => selectWorker(a.worker_umhid)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                    selectedWorker?.umhid === a.worker_umhid
                      ? 'bg-blue-50 border-[#003366] text-[#003366] dark:bg-sky-950/60 dark:border-sky-500/50 dark:text-white font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{a.worker_name}</span>
                      <span className="font-mono text-[10px] text-[#e65100] dark:text-amber-400">Token #{a.token_number}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{a.department} • {a.time_slot}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-slate-800 dark:text-emerald-300">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Migrant Worker Roster */}
          <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
            <div className="text-xs font-bold text-[#003366] dark:text-slate-300 uppercase tracking-wider">
              Quick Worker Selector (Multi-State Demo)
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {workersList.map((w) => (
                <div
                  key={w.id}
                  onClick={() => selectWorker(w.umhid)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                    selectedWorker?.id === w.id
                      ? 'bg-blue-50 border-[#003366] text-[#003366] dark:bg-sky-950/60 dark:border-sky-500/50 dark:text-white shadow-sm font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{w.full_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300">
                      {w.blood_group}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#003366] dark:text-emerald-400 font-bold mt-0.5">{w.umhid}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <span>{w.state_of_origin}</span>
                    <span className="text-[#e65100] dark:text-emerald-400 font-bold">➔</span>
                    <span>{w.current_state}</span>
                    <span>({w.occupation_sector.slice(0, 18)}...)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Longitudinal Interoperable EHR View (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedWorker ? (
            <>
              {/* Active Patient Identity & Consent Banner */}
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900/95 border-2 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl space-y-4">
                
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white font-serif">{selectedWorker.full_name}</h3>
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300">
                        {selectedWorker.blood_group}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1">
                      <span className="font-mono text-[#003366] dark:text-emerald-400 font-bold">{selectedWorker.umhid}</span>
                      <span>•</span>
                      <span>DOB: {new Date(selectedWorker.dob).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Sector: {selectedWorker.occupation_sector}</span>
                    </div>
                  </div>

                  {/* Actions: Consent & New Consultation */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsConsentOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:border-emerald-500/40 dark:text-emerald-300 text-xs font-bold transition"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Consent Verified (24h)</span>
                    </button>

                    <button
                      onClick={() => setIsConsultationOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#003366] dark:bg-gradient-to-r dark:from-sky-600 dark:to-teal-600 hover:bg-[#002244] text-white text-xs font-bold shadow-sm transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{t.recordNewConsultation}</span>
                    </button>
                  </div>
                </div>

                {/* Patient Health Alerts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800">
                    <span className="text-amber-800 dark:text-amber-400 font-bold block mb-0.5">Chronic Medical History:</span>
                    <span className="text-slate-800 dark:text-slate-300">{selectedWorker.chronic_conditions || 'None reported'}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 text-xs border border-rose-200 dark:border-rose-500/20">
                    <span className="text-rose-800 dark:text-rose-400 font-bold block mb-0.5">Drug / Chemical Allergies:</span>
                    <span className="text-rose-800 dark:text-rose-200 font-semibold">{selectedWorker.allergies || 'No known allergies'}</span>
                  </div>
                </div>

              </div>

              {/* Longitudinal Multi-Hospital Timeline */}
              {medicalHistory && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-[#003366] dark:text-white flex items-center gap-2 font-serif">
                      <Stethoscope className="w-5 h-5 text-[#003366] dark:text-sky-400" />
                      <span>Federated Multi-Hospital Longitudinal Health Record</span>
                    </h3>
                    <button
                      onClick={onOpenFHIR}
                      className="flex items-center gap-1 text-xs text-[#003366] dark:text-teal-400 hover:underline font-bold"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Inspect FHIR R4 Bundle</span>
                    </button>
                  </div>

                  <MedicalTimeline history={medicalHistory} onOpenFHIR={onOpenFHIR} />
                </div>
              )}

            </>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
              Select or scan a patient to view federated cross-hospital medical history
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />

      <NewConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        worker={selectedWorker}
        doctor={user}
        hospital={{ id: user?.hospital_id, name: user?.hospital_name }}
        onConsultationSaved={() => {
          if (selectedWorker) selectWorker(selectedWorker.umhid);
        }}
      />

      <ConsentGrantModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        worker={selectedWorker}
        doctor={user}
        onConsentGranted={() => {
          setIsConsentUnlocked(true);
        }}
      />

    </div>
  );
}
