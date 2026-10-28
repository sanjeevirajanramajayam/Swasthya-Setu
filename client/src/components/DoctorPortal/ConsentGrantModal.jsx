import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Unlock, ShieldCheck, KeyRound, QrCode, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ConsentGrantModal({ isOpen, onClose, worker, doctor, onConsentGranted }) {
  const { t } = useAuth();
  const [otpCode, setOtpCode] = useState('7729');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);

  if (!isOpen || !worker) return null;

  const handleRequestOTP = async () => {
    try {
      const res = await fetch('/api/consent/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          migrant_worker_id: worker.id,
          doctor_id: doctor?.id || 1,
          hospital_id: doctor?.hospital_id || 4,
          purpose: 'Interstate Multi-Hospital EHR Evaluation'
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedOtp(data.otpCode);
        setOtpCode(data.otpCode);
      }
    } catch (err) {
      console.error('Error requesting OTP:', err);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/consent/verify-and-grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker.id,
          otpCode: otpCode || '1234',
          qrToken: worker.qr_token
        }),
      });
      const data = await res.json();
      if (data.success) {
        onConsentGranted();
        onClose();
      } else {
        setError(data.message || 'Consent authorization failed');
      }
    } catch (err) {
      setError('Network verification error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Patient Record Consent</h3>
              <p className="text-xs text-slate-400">Secure ABDM/FHIR Authorization Handshake</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>Patient:</span>
            <span className="font-bold text-white">{worker.full_name}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Universal Health ID:</span>
            <span className="font-mono text-emerald-400">{worker.umhid}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Federated Scope:</span>
            <span className="text-sky-300 font-medium">All Multi-State Hospital Encounters</span>
          </div>
        </div>

        {/* OTP / PIN Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Enter Patient 4-Digit OTP / Secret PIN:
              </label>
              <button
                type="button"
                onClick={handleRequestOTP}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
              >
                Send SMS OTP
              </button>
            </div>
            
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="E.g. 7729 or 1234"
              className="w-full text-center tracking-widest font-mono text-2xl font-black py-3 rounded-2xl bg-slate-950 border border-emerald-500/40 text-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Demo Test Code: <code className="text-emerald-400 font-bold">7729</code> or <code className="text-emerald-400 font-bold">1234</code></span>
              <span className="text-slate-500">Valid for 24h</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 text-rose-300 text-xs border border-rose-500/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{submitting ? 'Verifying Authorization...' : 'Authorize & Unlock Longitudinal EHR'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
