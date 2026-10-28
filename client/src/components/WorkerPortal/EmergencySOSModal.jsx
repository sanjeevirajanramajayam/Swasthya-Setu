import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  X,
  PhoneCall,
  Droplet,
  AlertTriangle,
  HeartPulse,
  Ambulance,
  MapPin,
  Flame
} from 'lucide-react';

export default function EmergencySOSModal({ isOpen, onClose, worker }) {
  const { t } = useAuth();

  if (!isOpen || !worker) return null;

  const emergencyPayload = JSON.stringify({
    SOS: true,
    umhid: worker.umhid,
    name: worker.full_name,
    bloodGroup: worker.blood_group,
    allergies: worker.allergies,
    chronic: worker.chronic_conditions,
    emergencyContact: `${worker.emergency_contact_name} - ${worker.emergency_contact_phone}`,
    hospitalCoord: `${worker.current_district}, ${worker.current_state}`
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-lg">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-950 border-2 border-rose-600/80 p-6 sm:p-8 shadow-2xl shadow-rose-950/80 space-y-6">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-rose-900/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/50 animate-bounce">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white tracking-wide">EMERGENCY SOS PASS</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  CRITICAL HEALTH
                </span>
              </div>
              <p className="text-xs text-rose-300">Instant First-Responder Triage & Offline Access</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Worker Emergency Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Quick Critical Vitals */}
          <div className="sm:col-span-2 space-y-3">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Patient Full Name</div>
              <div className="text-xl font-black text-white">{worker.full_name}</div>
              <div className="font-mono text-xs text-emerald-400 font-bold">UMHID: {worker.umhid}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-rose-950/60 border border-rose-500/40 p-3.5 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-rose-300 block">Blood Group</span>
                <span className="text-2xl font-black text-white">{worker.blood_group}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Age & Gender</span>
                <span className="text-base font-bold text-slate-200">
                  {new Date().getFullYear() - new Date(worker.dob).getFullYear()} Yrs • {worker.gender}
                </span>
              </div>
            </div>

            {/* Critical Allergies & Hazards */}
            <div className="bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>SEVERE ALLERGIES (CRITICAL):</span>
              </div>
              <p className="text-xs text-white font-bold">{worker.allergies || 'None Known'}</p>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/30 p-3.5 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <HeartPulse className="w-4 h-4 text-amber-400" />
                <span>CHRONIC CONDITIONS:</span>
              </div>
              <p className="text-xs text-slate-200">{worker.chronic_conditions || 'None'}</p>
            </div>
          </div>

          {/* Quick SOS QR Scan for Paramedics */}
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border-4 border-rose-500 shadow-xl">
            <QRCodeSVG value={emergencyPayload} size={135} level="H" includeMargin={false} />
            <span className="text-[10px] font-black text-rose-900 mt-2 text-center uppercase tracking-tight">
              Paramedic Scan
            </span>
          </div>

        </div>

        {/* 1-Tap Emergency Hotlines */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            One-Tap Emergency Dispatch
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`tel:${worker.emergency_contact_phone}`}
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 transition"
            >
              <div className="text-xs">
                <div className="font-bold text-white">{worker.emergency_contact_name} ({worker.emergency_contact_relation})</div>
                <div className="text-[11px] text-emerald-300 font-mono">{worker.emergency_contact_phone}</div>
              </div>
              <PhoneCall className="w-5 h-5 text-emerald-400" />
            </a>

            <a
              href="tel:108"
              className="flex items-center justify-between p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 transition font-bold"
            >
              <div className="text-xs">
                <div className="text-white">National Ambulance (108 / 112)</div>
                <div className="text-[10px] text-rose-200">24x7 Emergency Triage</div>
              </div>
              <Ambulance className="w-6 h-6 text-white animate-pulse" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
