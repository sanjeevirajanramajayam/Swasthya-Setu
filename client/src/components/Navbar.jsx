import React from 'react';
import { useAuth } from '../context/AuthContext';
import { languages } from '../translations';
import {
  Activity,
  Globe,
  UserCheck,
  ShieldAlert,
  FileCode,
  HeartPulse,
  Stethoscope,
  Building2,
  BarChart3,
  QrCode,
  Sun,
  Moon,
  Volume2,
  ExternalLink,
  Lock
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenSOS, onOpenFHIR, onOpenQRScanner }) {
  const { user, lang, changeLanguage, theme, toggleTheme, demoUsers, switchDemoUser, t } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      
      {/* 🇮🇳 1. Top Government of India Accessibility & Ministry Ribbon */}
      <div className="bg-[#002244] dark:bg-slate-950 text-slate-200 text-[11px] border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 flex flex-wrap items-center justify-between gap-2">
          
          {/* Official Govt Tag */}
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <span>🇮🇳</span>
              <span>भारत सरकार | Government of India</span>
            </span>
            <span className="text-slate-400 hidden md:inline">|</span>
            <span className="text-slate-300 hidden md:inline">
              स्वास्थ्य एवं परिवार कल्याण मंत्रालय | Ministry of Health & Family Welfare
            </span>
          </div>

          {/* Accessibility & Theme Controls */}
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline text-slate-400 hover:text-white cursor-pointer flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-emerald-400" />
              <span>Screen Reader Access</span>
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            
            {/* Font Size A- A A+ */}
            <div className="flex items-center space-x-1 font-mono font-bold text-[10px] text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
              <span className="hover:text-amber-400 cursor-pointer px-1">A-</span>
              <span className="hover:text-amber-400 cursor-pointer px-1">A</span>
              <span className="hover:text-amber-400 cursor-pointer px-1">A+</span>
            </div>

            <span className="text-slate-500">|</span>

            {/* Theme Toggle (Govt Portal Classic Light / Modern Dark) */}
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition"
              title="Toggle Govt Portal Classic Light / Dark Mode"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3 h-3 text-amber-400" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Govt Classic (Light)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Indian Tricolor Bar */}
        <div className="govt-tricolor-bar" />
      </div>

      {/* 🏛️ 2. Main Government Header with Emblem / Ashoka Seal */}
      <div className="bg-[#003366] dark:bg-slate-900 text-white border-b-2 border-[#e65100] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* National Emblem & Portal Title */}
            <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => setActiveTab('worker')}>
              {/* Ashoka Stambh / State Emblem Icon Seal */}
              <div className="flex flex-col items-center justify-center p-1 bg-white/10 dark:bg-slate-800 rounded-lg border border-white/20">
                <div className="w-10 h-10 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-300 font-serif font-black text-xl border border-amber-400/40 shadow-inner">
                  🏛️
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
                    {t.appTitle}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-amber-500 text-[#002244] shadow-sm font-sans">
                    ABDM / FHIR
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-tight">
                  {t.appSubtitle}
                </p>
                <div className="text-[10px] text-amber-300/90 font-medium">
                  राष्ट्रीय स्वास्थ्य प्राधिकरण | National Health Authority (NHA)
                </div>
              </div>
            </div>

            {/* Quick Actions & Demo Switchers */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Emergency SOS Button */}
              <button
                onClick={onOpenSOS}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow-md text-xs font-bold transition border border-rose-400 animate-pulse"
                title="Emergency SOS Medical Pass"
              >
                <ShieldAlert className="w-4 h-4 text-white" />
                <span>{t.emergencySOS}</span>
              </button>

              {/* QR Scan Button for Doctor */}
              {user?.role === 'DOCTOR' && (
                <button
                  onClick={onOpenQRScanner}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm border border-sky-400"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{t.scanQR}</span>
                </button>
              )}

              {/* FHIR Standard Button */}
              <button
                onClick={onOpenFHIR}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#002244] hover:bg-[#001830] text-slate-200 text-xs font-medium transition border border-slate-600"
                title="HL7 / FHIR R4 Standard Payload"
              >
                <FileCode className="w-3.5 h-3.5 text-teal-400" />
                <span>FHIR R4</span>
              </button>

              {/* Language Selector */}
              <div className="relative flex items-center">
                <Globe className="w-3.5 h-3.5 text-slate-300 absolute left-2.5 pointer-events-none" />
                <select
                  value={lang}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-xs font-semibold rounded-md bg-[#002244] dark:bg-slate-950 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#002244] dark:bg-slate-900 text-white">
                      {l.native} ({l.label})
                    </option>
                  ))}
                </select>
              </div>

              {/* Demo Persona Switcher */}
              <div className="flex items-center pl-2 border-l border-slate-700">
                <select
                  value={user?.id || ''}
                  onChange={(e) => switchDemoUser(parseInt(e.target.value, 10))}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-md bg-amber-500 text-[#002244] hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer shadow-sm"
                  title="Switch Demo Role"
                >
                  <optgroup label="👷 Migrant Workers" className="bg-[#002244] text-white">
                    {demoUsers
                      .filter((u) => u.role === 'WORKER')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          👤 {u.full_name} ({u.worker_current_state || 'Worker'})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🩺 Doctors & Clinicians" className="bg-[#002244] text-white">
                    {demoUsers
                      .filter((u) => u.role === 'DOCTOR')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          🩺 {u.full_name} ({u.hospital_name ? u.hospital_name.split(' ')[0] : 'Doc'})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🏛️ Public Health Governance" className="bg-[#002244] text-white">
                    {demoUsers
                      .filter((u) => u.role === 'GOVERNANCE')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          🏛️ {u.full_name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🏥 Hospital Network Admins" className="bg-[#002244] text-white">
                    {demoUsers
                      .filter((u) => u.role === 'ADMIN')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          🏥 {u.full_name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* 📑 3. Classic Government Navigation Tabs */}
        <div className="bg-[#002244] dark:bg-slate-950 border-t border-slate-700/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto no-scrollbar py-1">
              
              <button
                onClick={() => setActiveTab('worker')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition ${
                  activeTab === 'worker'
                    ? 'border-[#ff9933] text-amber-400 bg-white/10'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                <span>{t.digitalHealthCard}</span>
              </button>

              <button
                onClick={() => setActiveTab('doctor')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition ${
                  activeTab === 'doctor'
                    ? 'border-[#ff9933] text-amber-400 bg-white/10'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-sky-400" />
                <span>{t.doctorPortal}</span>
              </button>

              <button
                onClick={() => setActiveTab('governance')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition ${
                  activeTab === 'governance'
                    ? 'border-[#ff9933] text-amber-400 bg-white/10'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>{t.governanceSurveillance}</span>
              </button>

              <button
                onClick={() => setActiveTab('hospitals')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition ${
                  activeTab === 'hospitals'
                    ? 'border-[#ff9933] text-amber-400 bg-white/10'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>{t.hospitalAdmin}</span>
              </button>

            </div>
          </div>
        </div>

      </div>

    </header>
  );
}
