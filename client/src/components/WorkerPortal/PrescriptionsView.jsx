import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pill, Sun, Moon, Sunrise, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PrescriptionsView({ encounters }) {
  const { t } = useAuth();

  if (!encounters || encounters.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No active prescriptions recorded yet.
      </div>
    );
  }

  // Aggregate all prescriptions from encounters
  const allPrescriptions = [];
  encounters.forEach((enc) => {
    if (enc.prescriptions && enc.prescriptions.length > 0) {
      enc.prescriptions.forEach((p) => {
        allPrescriptions.push({
          ...p,
          encounterDate: enc.encounter_date,
          hospitalName: enc.hospital_name,
          doctorName: enc.doctor_name,
          diagnosis: enc.diagnosis,
        });
      });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-[#003366] dark:text-white flex items-center gap-2 font-serif">
          <Pill className="w-5 h-5 text-[#e65100] dark:text-amber-400" />
          <span>{t.prescriptions}</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Visual multilingual medication schedule with morning, afternoon, and night dosage indicators
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allPrescriptions.map((p, idx) => {
          const isMorning = p.frequency.toLowerCase().includes('twice') || p.frequency.toLowerCase().includes('three') || p.frequency.toLowerCase().includes('morning') || p.frequency.toLowerCase().includes('once');
          const isAfternoon = p.frequency.toLowerCase().includes('three');
          const isNight = p.frequency.toLowerCase().includes('twice') || p.frequency.toLowerCase().includes('three') || p.frequency.toLowerCase().includes('bedtime') || p.frequency.toLowerCase().includes('night');

          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900/90 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-sm dark:shadow-xl space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-[#003366] dark:text-white">{p.medicine_name}</h4>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                    Dosage: <span className="text-[#e65100] dark:text-amber-300 font-bold">{p.dosage}</span> • {p.timing}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30">
                  {p.duration_days} Days
                </span>
              </div>

              {/* Visual Daily Time of Day Dosage Icons */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800/60 text-center">
                <div className={`p-2 rounded border ${isMorning ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                  <Sunrise className={`w-4 h-4 mx-auto mb-1 ${isMorning ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold uppercase block">{t.morning}</span>
                  <span className="text-xs font-black">{isMorning ? '1 Dose' : '-'}</span>
                </div>

                <div className={`p-2 rounded border ${isAfternoon ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                  <Sun className={`w-4 h-4 mx-auto mb-1 ${isAfternoon ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold uppercase block">{t.afternoon}</span>
                  <span className="text-xs font-black">{isAfternoon ? '1 Dose' : '-'}</span>
                </div>

                <div className={`p-2 rounded border ${isNight ? 'bg-indigo-100 border-indigo-300 text-indigo-900 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                  <Moon className={`w-4 h-4 mx-auto mb-1 ${isNight ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold uppercase block">{t.night}</span>
                  <span className="text-xs font-black">{isNight ? '1 Dose' : '-'}</span>
                </div>
              </div>

              {/* Instructions */}
              {p.instructions && (
                <div className="flex items-start gap-2 text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <AlertCircle className="w-3.5 h-3.5 text-[#e65100] dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{p.instructions}</span>
                </div>
              )}

              {/* Prescribed By Metadata */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                <div>Prescribed at: <span className="font-semibold text-slate-900 dark:text-slate-300">{p.hospitalName}</span></div>
                <div>Dr. {p.doctorName}</div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
