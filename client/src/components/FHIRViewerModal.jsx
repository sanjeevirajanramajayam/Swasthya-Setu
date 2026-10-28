import React, { useState, useEffect } from 'react';
import { X, FileCode, Copy, Check, Download } from 'lucide-react';

export default function FHIRViewerModal({ isOpen, onClose, workerId = 'IND-MIG-2026-8841' }) {
  const [fhirData, setFhirData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/encounters/fhir/bundle/${workerId}`)
        .then((res) => res.json())
        .then((data) => {
          setFhirData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, workerId]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (fhirData) {
      navigator.clipboard.writeText(JSON.stringify(fhirData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (fhirData) {
      const blob = new Blob([JSON.stringify(fhirData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FHIR-R4-Bundle-${workerId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-teal-500/40 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">HL7 FHIR R4 Bundle Payload</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  INTEROPERABILITY SCHEMA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Standardized Document Bundle for Federated Multi-Hospital Record Exchange
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code JSON Viewer */}
        <div className="flex-1 overflow-auto rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-emerald-400">
          {loading ? (
            <div className="text-slate-400 py-10 text-center font-sans">Generating FHIR R4 document bundle...</div>
          ) : (
            <pre className="whitespace-pre-wrap">{JSON.stringify(fhirData, null, 2)}</pre>
          )}
        </div>

        <div className="text-[11px] text-slate-500 text-right pt-2 border-t border-slate-800">
          Compliant with Ayushman Bharat Digital Mission (ABDM) & HL7 International FHIR Release 4
        </div>

      </div>
    </div>
  );
}
