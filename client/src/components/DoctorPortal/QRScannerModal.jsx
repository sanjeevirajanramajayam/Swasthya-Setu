import React, { useState } from 'react';
import { X, QrCode, Camera, Upload, CheckCircle2, Sparkles } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [manualInput, setManualInput] = useState('');
  const [selectedDemo, setSelectedDemo] = useState('IND-MIG-2026-8841');

  if (!isOpen) return null;

  const handleSimulatedScan = (umhid) => {
    onScanSuccess(umhid);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Scan Patient Health QR</h3>
              <p className="text-xs text-slate-400">Instant UMHID Resolution & Record Retrieval</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Scanner Frame */}
        <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="relative w-48 h-48 border-2 border-dashed border-sky-400 rounded-2xl flex items-center justify-center p-4">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-pulse" />
            <Camera className="w-12 h-12 text-slate-600 animate-pulse" />
            
            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-sky-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-sky-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-sky-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-sky-400" />
          </div>
          <span className="text-xs text-slate-400 mt-4 text-center">
            Point physical scanner or device camera at worker's QR Health Pass
          </span>
        </div>

        {/* One-Click Simulated Scan for Demo Evaluation */}
        <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950 border border-sky-500/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo QR Badges (Click to Scan):</span>
          </div>
          
          <div className="space-y-1.5">
            <button
              onClick={() => handleSimulatedScan('IND-MIG-2026-8841')}
              className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs border border-slate-800 flex items-center justify-between transition"
            >
              <div>
                <span className="font-bold text-white">Ramesh Kumar Mandal</span>
                <span className="text-slate-400 block text-[11px]">IND-MIG-2026-8841 (Bihar ➔ Kerala)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Scan Pass
              </span>
            </button>

            <button
              onClick={() => handleSimulatedScan('IND-MIG-2026-9204')}
              className="w-full text-left p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs border border-slate-800 flex items-center justify-between transition"
            >
              <div>
                <span className="font-bold text-white">Subir Mondal</span>
                <span className="text-slate-400 block text-[11px]">IND-MIG-2026-9204 (WB ➔ Gujarat)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                Scan Pass
              </span>
            </button>
          </div>
        </div>

        {/* Manual UMHID Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Or Type UMHID / Phone Number:</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="E.g. IND-MIG-2026-8841"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button
              onClick={() => {
                if (manualInput.trim()) handleSimulatedScan(manualInput.trim());
              }}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
            >
              Lookup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
