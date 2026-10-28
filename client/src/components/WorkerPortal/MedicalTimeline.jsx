import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Building2,
  User,
  Activity,
  FileText,
  Pill,
  Microscope,
  ShieldCheck,
  AlertOctagon,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export default function MedicalTimeline({ history, onOpenFHIR }) {
  const { t } = useAuth();

  if (!history || !history.encounters) {
    return (
      <div className="text-center py-12 text-slate-500">
        Loading longitudinal medical records across multi-hospital network...
      </div>
    );
  }

  const { encounters, statistics } = history;

  return (
    <div className="space-y-6">
      
      {/* Network Federation Summary Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Encounters</div>
          <div className="text-2xl font-black text-[#003366] dark:text-white mt-1">{statistics.totalEncounters}</div>
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">Across All States</div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Hospital Networks</div>
          <div className="text-2xl font-black text-[#003366] dark:text-sky-400 mt-1">{statistics.distinctHospitalNetworks}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Federated Providers</div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Prescriptions (Rx)</div>
          <div className="text-2xl font-black text-[#e65100] dark:text-amber-400 mt-1">{statistics.totalPrescriptions}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Active & Historical</div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Lab Reports</div>
          <div className="text-2xl font-black text-teal-800 dark:text-teal-400 mt-1">{statistics.totalLabReports}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Diagnostic Tests</div>
        </div>
      </div>

      {/* Cross-Hospital Network Badges */}
      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-[#003366] dark:text-emerald-400" />
          <span>Federated Hospital Facilities in Patient Record:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {statistics.hospitalsList.map((h, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-[#003366] dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-[#003366]/30 dark:border-slate-800 space-y-6">
        {encounters.map((enc) => (
          <div key={enc.id} className="relative">
            
            {/* Timeline node icon */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-2 w-8 h-8 rounded-full bg-[#003366] dark:bg-slate-900 border-2 border-white dark:border-emerald-500 flex items-center justify-center text-white shadow-md">
              <Stethoscope className="w-4 h-4 text-white dark:text-emerald-400" />
            </div>

            {/* Encounter Card */}
            <div className="bg-white dark:bg-slate-900/90 rounded-xl border-2 border-slate-200 dark:border-slate-800 p-5 shadow-sm dark:shadow-xl">
              
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-black text-[#003366] dark:text-white font-serif">{enc.hospital_name}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30">
                      {enc.hospital_state} ({enc.hospital_code})
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
                      {enc.encounter_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(enc.encounter_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <User className="w-3.5 h-3.5" />
                    <span className="font-semibold text-slate-800 dark:text-slate-300">{enc.doctor_name} ({enc.doctor_specialization})</span>
                  </div>
                </div>

                {enc.occupational_hazard_flag && enc.occupational_hazard_flag !== 'None' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-50 text-amber-900 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30 text-xs font-bold">
                    <AlertOctagon className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>Hazard: {enc.occupational_hazard_flag}</span>
                  </div>
                )}
              </div>

              {/* Vitals Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Blood Pressure</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{enc.vitals_bp || '120/80'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Pulse Rate</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{enc.vitals_pulse || '72 bpm'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">SpO2 Oxygen</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{enc.vitals_spo2 || '98%'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Temperature</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{enc.vitals_temp || '98.6 F'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Body Weight</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{enc.vitals_weight || '65 kg'}</span>
                </div>
              </div>

              {/* Clinical Assessment */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-bold">Chief Complaint: </span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{enc.chief_complaint}</span>
                </div>
                <div>
                  <span className="text-[#003366] dark:text-emerald-400 font-black">Clinical Diagnosis: </span>
                  <span className="font-black text-slate-900 dark:text-white">{enc.diagnosis}</span>
                  {enc.icd10_code && (
                    <span className="ml-2 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      ICD-10: {enc.icd10_code}
                    </span>
                  )}
                </div>
                {enc.treatment_plan && (
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 font-bold">Treatment & Advice: </span>
                    <span className="text-slate-800 dark:text-slate-300">{enc.treatment_plan}</span>
                  </div>
                )}
                {enc.clinical_notes && (
                  <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-400 text-[11px] italic border-l-2 border-[#003366] dark:border-slate-700">
                    "{enc.clinical_notes}"
                  </div>
                )}
              </div>

              {/* Prescriptions under this encounter */}
              {enc.prescriptions && enc.prescriptions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#e65100] dark:text-amber-300 mb-2">
                    <Pill className="w-3.5 h-3.5 text-[#e65100] dark:text-amber-400" />
                    <span>Prescribed Medications ({enc.prescriptions.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {enc.prescriptions.map((p) => (
                      <div key={p.id} className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="font-bold text-slate-900 dark:text-white">{p.medicine_name}</div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                          {p.dosage} • {p.frequency} • {p.timing}
                        </div>
                        <div className="text-emerald-800 dark:text-emerald-400 text-[10px] mt-0.5 font-bold">
                          Duration: {p.duration_days} days {p.instructions && `(${p.instructions})`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lab Reports under this encounter */}
              {enc.labReports && enc.labReports.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300 mb-2">
                    <Microscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Diagnostic Lab Investigations ({enc.labReports.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {enc.labReports.map((l) => (
                      <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-200">{l.test_name}</span>
                          <span className="text-slate-500 text-[11px] ml-2">({l.category})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-300">{l.result_value}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.status === 'Normal' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
