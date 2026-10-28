import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Droplet,
  AlertTriangle,
  PhoneCall,
  MapPin,
  Briefcase,
  Printer,
  ShieldCheck,
  Calendar,
  Sparkles,
  QrCode
} from 'lucide-react';

export default function HealthCard({ worker, onOpenSOS }) {
  const { t } = useAuth();
  const cardRef = useRef();

  if (!worker) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrPayload = JSON.stringify({
    umhid: worker.umhid,
    name: worker.full_name,
    dob: worker.dob,
    bloodGroup: worker.blood_group,
    allergies: worker.allergies,
    chronic: worker.chronic_conditions,
    emergencyPhone: worker.emergency_contact_phone,
    origin: worker.state_of_origin,
    current: worker.current_state,
    token: worker.qr_token
  });

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#003366] dark:text-white flex items-center gap-2 font-serif">
            <span>🏛️</span>
            <span>{t.digitalHealthCard}</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            National Migrant Worker Interoperable Digital Health Registry & Emergency Token
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#003366] dark:text-slate-200 text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.downloadCard}</span>
          </button>
          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition"
          >
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>{t.emergencySOS}</span>
          </button>
        </div>
      </div>

      {/* 🇮🇳 Authentic Government Health Pass (Aadhaar / ABHA Style in Light Mode) */}
      <div
        id="printable-health-card"
        ref={cardRef}
        className="relative overflow-hidden rounded-xl border-2 border-[#003366] dark:border-emerald-500/30 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/40 p-6 md:p-8 shadow-md dark:shadow-2xl"
      >
        {/* Tricolor Top Strip for Card */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

        {/* Card Header (Official Govt Style) */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-200 dark:border-slate-800 pb-5 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#003366] dark:bg-gradient-to-tr dark:from-emerald-600 dark:to-teal-500 flex items-center justify-center text-white shadow-sm font-serif font-black text-2xl">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wide text-[#003366] dark:text-white font-serif">
                  स्वास्थ्य सेतु | SWASTHYA SETU
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e65100] text-white dark:bg-emerald-500/20 dark:text-emerald-400">
                  GOVERNMENT OF INDIA
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                National Health Authority • Ministry of Health & Family Welfare
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
              {t.umhidLabel}
            </span>
            <span className="font-mono text-base font-black text-[#003366] dark:text-emerald-300 tracking-wider bg-slate-100 dark:bg-emerald-950/60 px-3 py-1 rounded border border-slate-300 dark:border-emerald-500/30 inline-block mt-0.5">
              {worker.umhid}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-center">
          
          {/* Worker Info */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-serif">
                {worker.full_name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  DOB: {new Date(worker.dob).toLocaleDateString()} ({worker.gender})
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/30 px-2.5 py-1 rounded">
                  <Droplet className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  Blood Group: {worker.blood_group}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 px-2.5 py-1 rounded">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {worker.vaccination_status}
                </span>
              </div>
            </div>

            {/* Migration Corridor & Occupation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#003366] dark:text-teal-400" />
                  <span>Migration Health Corridor</span>
                </div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                  <span>{worker.state_of_origin}</span>
                  <span className="text-[#e65100] dark:text-emerald-400 mx-2 font-black">➔</span>
                  <span className="text-[#003366] dark:text-emerald-300">{worker.current_state}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 truncate">{worker.current_address}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-[#003366] dark:text-cyan-400" />
                  <span>{t.occupationSector}</span>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{worker.occupation_sector}</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{worker.employer_or_contractor || 'Independent Workforce'}</p>
              </div>
            </div>

            {/* Medical Alerts Banner */}
            <div className="bg-amber-50 dark:bg-slate-950/70 p-3.5 rounded-lg border border-amber-200 dark:border-amber-500/20 space-y-1.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-300">{t.chronicConditions}: </span>
                  <span className="text-slate-800 dark:text-slate-300">{worker.chronic_conditions || 'None Recorded'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-rose-900 dark:text-rose-300">{t.allergies}: </span>
                  <span className="text-rose-800 dark:text-rose-200 font-semibold">{worker.allergies || 'No Known Drug Allergies'}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950/80 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-600 dark:text-slate-400">{t.emergencyContact}: </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {worker.emergency_contact_name} ({worker.emergency_contact_relation})
                </span>
              </div>
              <a
                href={`tel:${worker.emergency_contact_phone}`}
                className="flex items-center gap-1 font-mono font-bold text-[#003366] dark:text-emerald-400 hover:underline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                {worker.emergency_contact_phone}
              </a>
            </div>

          </div>

          {/* QR Code Passport */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-300">
              <QRCodeSVG
                value={qrPayload}
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="mt-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#003366] dark:text-emerald-400">
                <QrCode className="w-3.5 h-3.5" />
                <span>Offline Paramedic / QR Scan</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Scan by any doctor for instant offline verification across multi-hospital network
              </p>
            </div>
          </div>

        </div>

        {/* Card Footer Security Stamp */}
        <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-500">
          <div>Official National Health Registry Pass • FHIR Interoperability Standard</div>
          <div className="font-mono font-bold text-[#003366] dark:text-emerald-500/80">SECURE TOKEN: {worker.qr_token.slice(0, 24)}...</div>
        </div>

      </div>
    </div>
  );
}
