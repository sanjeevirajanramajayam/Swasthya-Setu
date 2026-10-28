import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Stethoscope,
  Activity,
  Pill,
  Microscope,
  Plus,
  Trash2,
  AlertOctagon,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function NewConsultationModal({ isOpen, onClose, worker, doctor, hospital, onConsultationSaved }) {
  const { t } = useAuth();

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [icd10Code, setIcd10Code] = useState('J45.909');
  const [occupationalHazard, setOccupationalHazard] = useState('Silicosis/Dust');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [encounterType, setEncounterType] = useState('OPD');

  // Vitals
  const [bp, setBp] = useState('124/82 mmHg');
  const [pulse, setPulse] = useState('78 bpm');
  const [spo2, setSpo2] = useState('97%');
  const [temp, setTemp] = useState('98.6 F');
  const [weight, setWeight] = useState('65 kg');

  // Prescriptions array
  const [prescriptions, setPrescriptions] = useState([
    {
      medicine_name: 'Formoterol 6mcg + Budesonide 400mcg DPI',
      dosage: '1 rotacap',
      frequency: 'Twice daily',
      timing: 'After Food',
      duration_days: 30,
      instructions: 'Rinse mouth with water thoroughly after inhalation'
    }
  ]);

  // Lab Reports array
  const [labReports, setLabReports] = useState([
    {
      test_name: 'Chest X-Ray PA View (Occupational Dust Screening)',
      category: 'Radiology',
      result_value: 'Early peri-bronchial thickening, no consolidation',
      reference_range: 'Clear lung fields',
      unit: '',
      status: 'Normal',
      lab_technician: 'On-duty Radiographer'
    }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !worker) return null;

  const addPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      {
        medicine_name: '',
        dosage: '1 tablet',
        frequency: 'Once daily',
        timing: 'After Food',
        duration_days: 7,
        instructions: ''
      }
    ]);
  };

  const removePrescriptionRow = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescriptionRow = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const addLabRow = () => {
    setLabReports([
      ...labReports,
      {
        test_name: '',
        category: 'Biochemistry',
        result_value: 'Pending evaluation',
        reference_range: '',
        unit: '',
        status: 'Normal',
        lab_technician: 'Staff'
      }
    ]);
  };

  const removeLabRow = (index) => {
    setLabReports(labReports.filter((_, i) => i !== index));
  };

  const updateLabRow = (index, field, value) => {
    const updated = [...labReports];
    updated[index][field] = value;
    setLabReports(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chiefComplaint || !diagnosis) {
      alert('Please fill Chief Complaint and Diagnosis');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          migrant_worker_id: worker.id,
          hospital_id: hospital?.id || doctor?.hospital_id || 4,
          doctor_id: doctor?.id || 1,
          encounter_type: encounterType,
          chief_complaint: chiefComplaint,
          vitals_bp: bp,
          vitals_pulse: pulse,
          vitals_spo2: spo2,
          vitals_temp: temp,
          vitals_weight: weight,
          diagnosis,
          icd10_code: icd10Code,
          occupational_hazard_flag: occupationalHazard,
          treatment_plan: treatmentPlan,
          clinical_notes: clinicalNotes,
          prescriptions,
          lab_reports: labReports,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        if (onConsultationSaved) onConsultationSaved();
      }
    } catch (err) {
      console.error('Error recording consultation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Record Clinical Encounter</h3>
              <p className="text-xs text-slate-400">
                Patient: <span className="text-emerald-400 font-bold">{worker.full_name}</span> ({worker.umhid})
              </p>
            </div>
          </div>
          <button
            onClick={() => { setSuccess(false); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Consultation Encounter Synchronized!</h4>
              <p className="text-xs text-slate-400 mt-1">
                EHR, prescriptions, and lab orders have been published to the national interoperability grid.
              </p>
            </div>
            <button
              onClick={() => { setSuccess(false); onClose(); }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
            >
              Close & View Updated Patient Timeline
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Encounter Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Encounter Type</label>
                <select
                  value={encounterType}
                  onChange={(e) => setEncounterType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="OPD">OPD Consultation</option>
                  <option value="Occupational Checkup">Occupational Health Checkup</option>
                  <option value="Emergency">Emergency Trauma Triage</option>
                  <option value="Follow-up">Follow-up Review</option>
                  <option value="Inpatient">Inpatient Admission</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Occupational Hazard Tag</label>
                <select
                  value={occupationalHazard}
                  onChange={(e) => setOccupationalHazard(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="None">None / Standard</option>
                  <option value="Silicosis/Dust">Silicosis / Mineral Dust</option>
                  <option value="Pesticide/Chemical">Pesticide / Chemical Fumes</option>
                  <option value="Heat Stress">Heat Stress & Dehydration</option>
                  <option value="Ergonomic/Musculoskeletal">Ergonomic / Heavy Lifting Strain</option>
                  <option value="Noise/Vibration">Noise / Heavy Vibration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ICD-10 Code</label>
                <input
                  type="text"
                  value={icd10Code}
                  onChange={(e) => setIcd10Code(e.target.value)}
                  placeholder="E.g. J45.909, J62.8"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Vital Signs */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                <Activity className="w-4 h-4" />
                <span>Patient Vitals at Triage</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">BP (mmHg)</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Pulse (bpm)</label>
                  <input
                    type="text"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">SpO2 (%)</label>
                  <input
                    type="text"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Temp (F)</label>
                  <input
                    type="text"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Weight (kg)</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Complaints & Diagnosis */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chief Complaint & Symptoms Presenting:
                </label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="E.g. Recurrent wheezing, nighttime coughing after stone cutting shifts"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Clinical Diagnosis:
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="E.g. Occupational Asthma with Dust Bronchospasm"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Treatment Advice & Occupational Safety Protocol:
                </label>
                <textarea
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  rows={2}
                  placeholder="E.g. Advised N95 dust respirator, nebulization, avoid dry grit grinding"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Electronic Prescription (Rx) Builder */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Pill className="w-4 h-4" />
                  <span>Digital Prescription (Rx)</span>
                </div>
                <button
                  type="button"
                  onClick={addPrescriptionRow}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-2">
                {prescriptions.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 items-center text-xs">
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Medicine name & strength"
                        value={p.medicine_name}
                        onChange={(e) => updatePrescriptionRow(idx, 'medicine_name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={p.dosage}
                        onChange={(e) => updatePrescriptionRow(idx, 'dosage', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={p.frequency}
                        onChange={(e) => updatePrescriptionRow(idx, 'frequency', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                      >
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="SOS (As needed)">SOS (As needed)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={p.timing}
                        onChange={(e) => updatePrescriptionRow(idx, 'timing', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                      >
                        <option value="After Food">After Food</option>
                        <option value="Before Food">Before Food</option>
                        <option value="Bedtime">Bedtime</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <input
                        type="number"
                        placeholder="Days"
                        value={p.duration_days}
                        onChange={(e) => updatePrescriptionRow(idx, 'duration_days', parseInt(e.target.value, 10))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removePrescriptionRow(idx)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Lab Order Builder */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400">
                  <Microscope className="w-4 h-4" />
                  <span>Diagnostic Lab Investigations Ordered</span>
                </div>
                <button
                  type="button"
                  onClick={addLabRow}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lab Test</span>
                </button>
              </div>

              <div className="space-y-2">
                {labReports.map((l, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 items-center text-xs">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        placeholder="Test name (e.g. Spirometry PFT, Chest X-ray)"
                        value={l.test_name}
                        onChange={(e) => updateLabRow(idx, 'test_name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Result summary"
                        value={l.result_value}
                        onChange={(e) => updateLabRow(idx, 'result_value', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={l.status}
                        onChange={(e) => updateLabRow(idx, 'status', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Abnormal">Abnormal</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeLabRow(idx)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-sky-900/40 transition"
              >
                {submitting ? 'Publishing to Network...' : 'Save & Publish Consultation (EHR)'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
