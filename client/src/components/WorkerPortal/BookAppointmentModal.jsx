import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Calendar, Clock, Building2, Stethoscope, CheckCircle2, Ticket } from 'lucide-react';

export default function BookAppointmentModal({ isOpen, onClose, worker, onAppointmentBooked }) {
  const { t } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [department, setDepartment] = useState('Pulmonology');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 10:30 AM');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/hospitals')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.hospitals.length > 0) {
            setHospitals(data.hospitals);
            setSelectedHospital(data.hospitals[0].id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen || !worker) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          migrant_worker_id: worker.id,
          hospital_id: parseInt(selectedHospital, 10),
          department,
          appointment_date: appointmentDate,
          time_slot: timeSlot,
          symptoms_summary: symptoms || 'General follow-up consultation',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessData(data);
        if (onAppointmentBooked) onAppointmentBooked();
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t.bookAppointment}</h3>
              <p className="text-xs text-slate-400">Interstate Multi-Hospital Appointment & Queue Token</p>
            </div>
          </div>
          <button
            onClick={() => { setSuccessData(null); onClose(); }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Screen */}
        {successData ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Appointment Confirmed!</h4>
              <p className="text-xs text-slate-400 mt-1">
                Your consultation token has been generated on the national hospital grid.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 inline-block text-center space-y-1">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t.tokenNumber}</div>
              <div className="text-4xl font-black text-emerald-400 font-mono">#{successData.tokenNumber}</div>
              <div className="text-[11px] text-slate-400">Date: {appointmentDate} • Slot: {timeSlot}</div>
            </div>

            <div>
              <button
                onClick={() => { setSuccessData(null); onClose(); }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hospital Network Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Select Participating Hospital Network:</span>
              </label>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — {h.district}, {h.state} ({h.tier})
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-sky-400" />
                  <span>Department:</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Pulmonology">Pulmonology (Respiratory)</option>
                  <option value="Occupational Health">Occupational & Work Health</option>
                  <option value="Orthopedics">Orthopedics & Spine</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology (Chemical/Dust)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Date:</span>
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Preferred Time Slot:</span>
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                <option value="03:30 PM - 04:00 PM">03:30 PM - 04:00 PM</option>
              </select>
            </div>

            {/* Symptoms Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Symptoms / Reason for Visit:
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={2}
                placeholder="E.g. Cough after dust exposure, chest tightness, routine follow-up"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition"
              >
                {submitting ? 'Allocating Queue Token...' : 'Confirm Hospital Booking'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
