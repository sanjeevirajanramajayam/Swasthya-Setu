import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import InteractiveHealthMap from '../Common/InteractiveHealthMap';
import {
  ShieldAlert,
  Activity,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Building2,
  Users,
  Eye,
  PlusCircle,
  FileCheck,
  Flame,
  Radio,
  X,
  CheckCircle2
} from 'lucide-react';

export default function GovernanceDashboard() {
  const { t } = useAuth();

  const [outbreaksData, setOutbreaksData] = useState(null);
  const [migrationData, setMigrationData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state for broadcasting alert
  const [diseaseName, setDiseaseName] = useState('');
  const [diseaseCategory, setDiseaseCategory] = useState('Vector-borne');
  const [clusterName, setClusterName] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Kerala');
  const [lat, setLat] = useState('10.0261');
  const [lng, setLng] = useState('76.3125');
  const [activeCases, setActiveCases] = useState('25');
  const [severityLevel, setSeverityLevel] = useState('High');
  const [workforceRisk, setWorkforceRisk] = useState('1500');
  const [intervention, setIntervention] = useState('');
  const [submittingAlert, setSubmittingAlert] = useState(false);

  const [hospitals, setHospitals] = useState([]);

  const loadGovernanceData = async () => {
    try {
      setLoading(true);
      const [oRes, mRes, aRes, hRes] = await Promise.all([
        fetch('/api/governance/outbreak-hotspots'),
        fetch('/api/governance/migration-analytics'),
        fetch('/api/governance/audit-logs'),
        fetch('/api/hospitals'),
      ]);

      const oData = await oRes.json();
      const mData = await mRes.json();
      const aData = await aRes.json();
      const hData = await hRes.json();

      if (oData.success) setOutbreaksData(oData);
      if (mData.success) setMigrationData(mData);
      if (aData.success) setAuditLogs(aData.logs);
      if (hData.success) setHospitals(hData.hospitals);
    } catch (err) {
      console.error('Governance data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGovernanceData();
  }, []);

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    setSubmittingAlert(true);
    try {
      const res = await fetch('/api/governance/outbreak-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease_name: diseaseName,
          disease_category: diseaseCategory,
          cluster_name: clusterName,
          district,
          state,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          active_cases: parseInt(activeCases, 10),
          severity_level: severityLevel,
          migrant_workforce_exposure: parseInt(workforceRisk, 10),
          recommended_intervention: intervention,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAlertModalOpen(false);
        loadGovernanceData();
      }
    } catch (err) {
      console.error('Broadcast alert error:', err);
    } finally {
      setSubmittingAlert(false);
    }
  };

  const filteredOutbreaks = outbreaksData?.outbreaks?.filter((o) => {
    if (selectedFilter === 'All') return true;
    return o.disease_category === selectedFilter;
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* Governance Banner & Broadcast Action (Govt Portal Style) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-xl bg-[#003366] dark:bg-gradient-to-r dark:from-purple-950/80 dark:via-slate-900 dark:to-slate-900 text-white border-b-2 border-[#e65100] dark:border-purple-500/30 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-white/10 dark:bg-purple-600/30 border border-white/20 dark:border-purple-500/50 flex items-center justify-center text-white dark:text-purple-300 shadow-sm">
            <Radio className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-serif">Public Health Surveillance & Governance Grid</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e65100] text-white dark:bg-purple-500/20 dark:text-purple-300">
                INTEGRATED DISEASE SURVEILLANCE
              </span>
            </div>
            <p className="text-xs text-slate-200 dark:text-slate-400 mt-0.5 font-medium">
              National Center for Disease Control (NCDC) • Real-time outbreak cluster detection & audit logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#e65100] hover:bg-[#d84315] text-white text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Broadcast Outbreak Alert</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
            <span>Registered Migrant Workers</span>
            <Users className="w-4 h-4 text-[#003366] dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-[#003366] dark:text-white mt-2">
            {migrationData?.metrics?.totalRegisteredWorkers || 5}
          </div>
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">100% Unique UMHIDs Generated</div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
            <span>Multi-Hospital Network</span>
            <Building2 className="w-4 h-4 text-[#003366] dark:text-sky-400" />
          </div>
          <div className="text-3xl font-black text-[#003366] dark:text-sky-400 mt-2">
            {migrationData?.metrics?.totalHospitalNetworks || 6}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across 6 States / Zones</div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
            <span>Cross-State Consultations</span>
            <TrendingUp className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-800 dark:text-teal-400 mt-2">
            {migrationData?.metrics?.crossStateInteroperableConsultations || 4}
          </div>
          <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400 mt-1">Zero Record Loss Across Borders</div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
            <span>Active Outbreak Hotspots</span>
            <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-700 dark:text-rose-400 mt-2">
            {outbreaksData?.summary?.totalActiveCases || 277}
          </div>
          <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400 mt-1">
            {outbreaksData?.summary?.totalWorkforceAtRisk?.toLocaleString()} Workers In Exposure Zone
          </div>
        </div>
      </div>

      {/* High-Definition Interactive Outbreak & Surveillance Map Grid */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-[#003366] dark:text-white flex items-center gap-2 font-serif">
              <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>National Epidemiological Outbreak Surveillance Map</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Interactive multi-layer geospatial tracking: Switch between Satellite HD, Tactical Dark, Voyager, or Minimal Light basemaps
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-md border border-slate-300 dark:border-slate-800 text-xs">
            {['All', 'Vector-borne', 'Occupational', 'Water-borne', 'Respiratory'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1 rounded font-bold transition ${
                  selectedFilter === cat
                    ? 'bg-[#003366] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Master Interactive Health Map */}
        <InteractiveHealthMap
          outbreaks={outbreaksData?.outbreaks || []}
          hospitals={hospitals}
          selectedCategory={selectedFilter}
          onSelectCategory={setSelectedFilter}
          onOpenAlertModal={(outbreak) => {
            if (outbreak) {
              setDiseaseName(outbreak.disease_name || '');
              setClusterName(outbreak.cluster_name || '');
              setDistrict(outbreak.district || '');
              setState(outbreak.state || 'Kerala');
              setLat(String(outbreak.lat || ''));
              setLng(String(outbreak.lng || ''));
              setActiveCases(String(outbreak.active_cases || ''));
              setSeverityLevel(outbreak.severity_level || 'High');
              setIntervention(outbreak.recommended_intervention || '');
            }
            setIsAlertModalOpen(true);
          }}
        />
      </div>

      {/* Analytics Rows: Migration Corridors & Occupational Hazards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Migration Origin vs Inflow Distribution */}
        <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-black text-[#003366] dark:text-white flex items-center gap-2 font-serif">
              <TrendingUp className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>Migration Health Inflow Corridors</span>
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">Interstate Origin Breakdown</span>
          </div>

          <div className="space-y-2.5">
            {migrationData?.originDistribution?.map((item, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>State of Origin: <strong className="text-[#003366] dark:text-white">{item.state_of_origin}</strong></span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{item.worker_count} Registered Workers</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                  Dominant Sectors: {item.sectors}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Occupational Hazards & Syndromic Surveillance */}
        <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-black text-[#003366] dark:text-white flex items-center gap-2 font-serif">
              <AlertTriangle className="w-5 h-5 text-[#e65100] dark:text-amber-400" />
              <span>Occupational Hazards Surveillance</span>
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">Workplace Health Flags</span>
          </div>

          <div className="space-y-2.5">
            {migrationData?.occupationalHazards?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e65100] dark:bg-amber-400"></span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{item.occupational_hazard_flag}</span>
                </div>
                <span className="font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30">
                  {item.encounter_count} Clinical Incidents
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Security & Access Audit Log Grid (Classic Govt Table) */}
      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-black text-[#003366] dark:text-white flex items-center gap-2 font-serif">
              <FileCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <span>National Health Interoperability Audit Trail</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Immutable logging of all cross-hospital medical record retrievals and patient consent verifications
            </p>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-100 text-[#003366] border border-blue-300 dark:bg-teal-500/20 dark:text-teal-300">
            {auditLogs.length} Logged Events
          </span>
        </div>

        <div className="overflow-x-auto max-h-64 overflow-y-auto border border-slate-300 dark:border-slate-800 rounded">
          <table className="govt-table text-left text-xs">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Patient (UMHID)</th>
                <th>Accessor / Facility</th>
                <th>Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono text-slate-700 dark:text-slate-400 font-semibold">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span className="font-bold text-slate-900 dark:text-white">{log.worker_name}</span>
                    <span className="block font-mono text-[10px] text-[#003366] dark:text-slate-500 font-semibold">{log.worker_umhid}</span>
                  </td>
                  <td>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{log.accessor_name || 'System Auto'}</span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">{log.hospital_name || 'Central Grid'}</span>
                  </td>
                  <td className="text-slate-700 dark:text-slate-400 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Alert Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 border-2 border-[#003366] dark:border-purple-500/40 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-md bg-[#003366] dark:bg-purple-500/20 text-white dark:text-purple-400 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#003366] dark:text-white font-serif">Broadcast Outbreak Alert</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add to National Epidemiological Grid</p>
                </div>
              </div>
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="p-1.5 rounded text-slate-500 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastAlert} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Disease / Syndromic Name:</label>
                <input
                  type="text"
                  placeholder="E.g. Acute Respiratory Illness Spike"
                  value={diseaseName}
                  onChange={(e) => setDiseaseName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category:</label>
                  <select
                    value={diseaseCategory}
                    onChange={(e) => setDiseaseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                  >
                    <option value="Vector-borne">Vector-borne</option>
                    <option value="Occupational">Occupational</option>
                    <option value="Water-borne">Water-borne</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Viral">Viral</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Severity:</label>
                  <select
                    value={severityLevel}
                    onChange={(e) => setSeverityLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cluster Location / Settlement Name:</label>
                <input
                  type="text"
                  placeholder="E.g. Vallarpadam Labour Barracks Zone"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">District:</label>
                  <input
                    type="text"
                    placeholder="Ernakulam"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">State:</label>
                  <input
                    type="text"
                    placeholder="Kerala"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Active Cases:</label>
                  <input
                    type="number"
                    value={activeCases}
                    onChange={(e) => setActiveCases(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Workforce Exposure:</label>
                  <input
                    type="number"
                    value={workforceRisk}
                    onChange={(e) => setWorkforceRisk(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Intervention Protocol:</label>
                <textarea
                  value={intervention}
                  onChange={(e) => setIntervention(e.target.value)}
                  rows={2}
                  placeholder="E.g. Deploy mobile fever screening, supply chlorination tablets"
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-200 text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAlert}
                  className="px-6 py-2 rounded bg-[#003366] hover:bg-[#002244] text-white font-bold transition"
                >
                  {submittingAlert ? 'Broadcasting...' : 'Publish to Heatmap Grid'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
