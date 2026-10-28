import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HealthCard from './components/WorkerPortal/HealthCard';
import MedicalTimeline from './components/WorkerPortal/MedicalTimeline';
import PrescriptionsView from './components/WorkerPortal/PrescriptionsView';
import BookAppointmentModal from './components/WorkerPortal/BookAppointmentModal';
import EmergencySOSModal from './components/WorkerPortal/EmergencySOSModal';
import DoctorDashboard from './components/DoctorPortal/DoctorDashboard';
import QRScannerModal from './components/DoctorPortal/QRScannerModal';
import GovernanceDashboard from './components/GovernancePortal/GovernanceDashboard';
import HospitalAdminDashboard from './components/HospitalAdmin/HospitalAdminDashboard';
import FHIRViewerModal from './components/FHIRViewerModal';
import {
  HeartPulse,
  Clock,
  Calendar,
  Pill,
  Stethoscope,
  BarChart3,
  Building2,
  Sparkles,
  PlusCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const { user, t } = useAuth();

  // Active top-level tab
  const [activeTab, setActiveTab] = useState('worker');

  // Sub-tabs in Worker view
  const [workerSubTab, setWorkerSubTab] = useState('timeline');

  // Active worker state
  const [workerDetails, setWorkerDetails] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);

  // Global modals
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isFHIROpen, setIsFHIROpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isBookApptOpen, setIsBookApptOpen] = useState(false);

  // Auto-switch primary tab if user role changes via persona switcher
  useEffect(() => {
    if (user?.role === 'DOCTOR') setActiveTab('doctor');
    else if (user?.role === 'GOVERNANCE') setActiveTab('governance');
    else if (user?.role === 'ADMIN') setActiveTab('hospitals');
    else if (user?.role === 'WORKER') setActiveTab('worker');
  }, [user?.role]);

  // Fetch worker longitudinal history
  const loadWorkerData = async () => {
    const umhid = user?.workerProfile?.umhid || 'IND-MIG-2026-8841';
    try {
      const [wRes, hRes] = await Promise.all([
        fetch(`/api/workers/lookup/${umhid}`),
        fetch(`/api/workers/${umhid}/longitudinal-history`)
      ]);
      const wData = await wRes.json();
      const hData = await hRes.json();

      if (wData.success) setWorkerDetails(wData.worker);
      if (hData.success) setMedicalHistory(hData);
    } catch (err) {
      console.error('Error fetching worker data:', err);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, [user]);

  const handleQRScanSuccess = (umhid) => {
    setActiveTab('doctor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-[#003366] selection:text-white">
      
      {/* Top Government Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenFHIR={() => setIsFHIROpen(true)}
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: MIGRANT WORKER PORTAL */}
        {activeTab === 'worker' && (
          <div className="space-y-6">
            
            {/* Digital Health Pass */}
            {workerDetails && (
              <HealthCard
                worker={workerDetails}
                onOpenSOS={() => setIsSOSOpen(true)}
              />
            )}

            {/* Worker Portal Sub Navigation & Action Bar (Govt Style) */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-300 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWorkerSubTab('timeline')}
                  className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    workerSubTab === 'timeline'
                      ? 'bg-[#003366] text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.medicalTimeline}</span>
                </button>

                <button
                  onClick={() => setWorkerSubTab('prescriptions')}
                  className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    workerSubTab === 'prescriptions'
                      ? 'bg-[#003366] text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>{t.prescriptions}</span>
                </button>

                <button
                  onClick={() => setWorkerSubTab('appointments')}
                  className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                    workerSubTab === 'appointments'
                      ? 'bg-[#003366] text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.appointments}</span>
                </button>
              </div>

              {/* Book Appointment CTA */}
              <button
                onClick={() => setIsBookApptOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#e65100] hover:bg-[#d84315] text-white text-xs font-bold shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.bookAppointment}</span>
              </button>
            </div>

            {/* Sub-view Content */}
            {workerSubTab === 'timeline' && medicalHistory && (
              <MedicalTimeline history={medicalHistory} onOpenFHIR={() => setIsFHIROpen(true)} />
            )}

            {workerSubTab === 'prescriptions' && medicalHistory && (
              <PrescriptionsView encounters={medicalHistory.encounters} />
            )}

            {workerSubTab === 'appointments' && medicalHistory && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-[#003366] dark:text-white flex items-center gap-2 font-serif">
                    <Calendar className="w-5 h-5 text-[#003366] dark:text-sky-400" />
                    <span>My Hospital Appointments & OPD Queue Status</span>
                  </h3>
                  <button
                    onClick={() => setIsBookApptOpen(true)}
                    className="text-xs text-[#e65100] hover:underline font-bold"
                  >
                    + Book New Hospital Slot
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medicalHistory.appointments?.map((a) => (
                    <div key={a.id} className="p-5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-base font-serif">{a.hospital_name}</span>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300">
                          {a.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Department: <strong className="text-slate-900 dark:text-white">{a.department}</strong></div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Date: {a.appointment_date} • {a.time_slot}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Queue Token</span>
                          <span className="font-mono text-2xl font-black text-[#e65100] dark:text-amber-400">#{a.token_number}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{a.symptoms_summary}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: DOCTOR / CLINICAL PORTAL */}
        {activeTab === 'doctor' && (
          <DoctorDashboard onOpenFHIR={() => setIsFHIROpen(true)} />
        )}

        {/* VIEW 3: HEALTHCARE GOVERNANCE & OUTBREAK HEATMAP */}
        {activeTab === 'governance' && (
          <GovernanceDashboard />
        )}

        {/* VIEW 4: HOSPITAL NETWORK ADMIN */}
        {activeTab === 'hospitals' && (
          <HospitalAdminDashboard />
        )}

      </main>

      {/* Global Modals */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        worker={workerDetails}
      />

      <FHIRViewerModal
        isOpen={isFHIROpen}
        onClose={() => setIsFHIROpen(false)}
        workerId={workerDetails?.umhid || 'IND-MIG-2026-8841'}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />

      <BookAppointmentModal
        isOpen={isBookApptOpen}
        onClose={() => setIsBookApptOpen(false)}
        worker={workerDetails}
        onAppointmentBooked={loadWorkerData}
      />

      {/* Classic Government Footer */}
      <footer className="border-t-4 border-[#003366] bg-[#002244] text-slate-200 py-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/60 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-base font-black font-serif text-white">स्वास्थ्य सेतु | SWASTHYA SETU</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-400 font-semibold">National Migrant Worker Health Record & Governance Grid</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-slate-300">
              <span className="hover:underline cursor-pointer">Terms of Service</span>
              <span>|</span>
              <span className="hover:underline cursor-pointer">Privacy Policy</span>
              <span>|</span>
              <span className="hover:underline cursor-pointer">Hyperlinking Policy</span>
              <span>|</span>
              <span className="hover:underline cursor-pointer">Accessibility Statement</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              Designed & Developed for National Health Authority (NHA) & Ministry of Health & Family Welfare • Government of India
            </div>
            <div className="font-mono text-amber-400/90">
              Last Updated: 31 August 2026 | Portal Version 1.4.0 (NIC Compliant)
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
