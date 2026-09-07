import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  MapPin,
  LogOut,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Box,
  ChevronRight,
  Filter,
  RefreshCw,
  Download,
  Printer,
} from 'lucide-react';

import { exportToCSV, printWorkOrderReport } from '../utils/exportUtils';
import { useAuth } from '../context/AuthContext';
import { complaintApi } from '../api/complaintApi';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import DashboardCharts from '../components/DashboardCharts';
import DashboardMap from '../components/DashBoardMap';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, high: 0, medium: 0, low: 0 });

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const listContainerRef = useRef(null);
  const statsContainerRef = useRef(null);

  const parseList = (res) => {
    const raw = res?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.complaints)) return raw.complaints;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.data?.complaints)) return raw.data.complaints;
    return [];
  };

  const fetchStats = async () => {
    try {
      const [allRes, highRes, medRes, lowRes] = await Promise.all([
        complaintApi.getOfficerComplaints(),
        complaintApi.getOfficerComplaints({ severity: 'HIGH' }),
        complaintApi.getOfficerComplaints({ severity: 'MEDIUM' }),
        complaintApi.getOfficerComplaints({ severity: 'LOW' }),
      ]);

      setStats({
        total: parseList(allRes).length,
        high: parseList(highRes).length,
        medium: parseList(medRes).length,
        low: parseList(lowRes).length,
      });
    } catch (err) {
      console.error('Failed to load stat counts:', err);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await complaintApi.getOfficerComplaints(params);
      setComplaints(parseList(res));
    } catch (err) {
      console.error('Failed to fetch complaint queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [severityFilter, statusFilter]);

  // GSAP initial cards reveal
  useEffect(() => {
    if (statsContainerRef.current) {
      gsap.fromTo(
        statsContainerRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, []);

  // GSAP staggered list reveal when complaints change
  useEffect(() => {
    if (!loading && listContainerRef.current?.children?.length > 0) {
      gsap.fromTo(
        listContainerRef.current.children,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.05,
          ease: 'power2.out',
        }
      );
    }
  }, [complaints, loading]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans select-none">
      <nav className="border-b border-neutral-800 bg-[#0a0a0a]/90 backdrop-blur sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white text-black p-1.5 rounded-lg flex items-center justify-center">
            <MapPin size={17} className="stroke-[2.5]" />
          </div>
          <span className="font-bold tracking-widest text-sm text-neutral-100">CIVICFIX</span>
          <span className="text-xs bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded ml-2">
            Officer Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-neutral-400 hidden sm:inline">
            {user?.email || 'Officer Session'}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Export Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Infrastructure Triage Queue
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Priority-sorted live feed computed from citizen submissions and AR spatial reports.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export CSV */}
            <button
              onClick={() => exportToCSV(complaints)}
              disabled={complaints.length === 0}
              className="flex items-center gap-1.5 text-xs bg-neutral-900 border border-neutral-800 hover:border-neutral-700 disabled:opacity-50 text-neutral-300 px-3 py-2 rounded-xl transition cursor-pointer"
              title="Download CSV spreadsheet"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            {/* Print / Save PDF Work Order */}
            <button
              onClick={() =>
                printWorkOrderReport(complaints, {
                  severity: severityFilter,
                  status: statusFilter,
                })
              }
              disabled={complaints.length === 0}
              className="flex items-center gap-1.5 text-xs bg-neutral-900 border border-neutral-800 hover:border-neutral-700 disabled:opacity-50 text-neutral-300 px-3 py-2 rounded-xl transition cursor-pointer"
              title="Print contractor work order report"
            >
              <Printer size={13} />
              <span>Print Order (PDF)</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                fetchStats();
                fetchComplaints();
              }}
              className="flex items-center gap-1.5 text-xs bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Animated Stat Cards Grid */}
        <div ref={statsContainerRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Reports"
            count={stats.total}
            icon={Box}
            colorStyles={{
              border: 'border-neutral-800/90',
              headerText: 'text-neutral-500',
              valueText: 'text-white',
            }}
          />
          <StatCard
            label="Critical / High"
            count={stats.high}
            icon={Flame}
            colorStyles={{
              border: 'border-red-950/60',
              headerText: 'text-red-400',
              valueText: 'text-red-300',
            }}
          />
          <StatCard
            label="Medium Priority"
            count={stats.medium}
            icon={AlertTriangle}
            colorStyles={{
              border: 'border-amber-950/60',
              headerText: 'text-amber-400',
              valueText: 'text-amber-300',
            }}
          />
          <StatCard
            label="Low Priority"
            count={stats.low}
            icon={CheckCircle2}
            colorStyles={{
              border: 'border-emerald-950/60',
              headerText: 'text-emerald-400',
              valueText: 'text-emerald-300',
            }}
          />
        </div>

        {/* Chart.js Analytical Overview */}
        <DashboardCharts stats={stats} complaints={complaints} />

        {/* Geospatial Map */}
        <DashboardMap complaints={complaints} />

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111] border border-neutral-800/80 p-3 rounded-2xl mb-6">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-neutral-500 ml-1" />
            <span className="text-xs text-neutral-400 font-medium mr-2">Filters:</span>

            <div className="inline-flex bg-[#0a0a0a] p-1 rounded-xl border border-neutral-800">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                    severityFilter === s
                      ? 'bg-neutral-200 text-black shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-neutral-400">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0a0a0a] border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-neutral-600 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Complaint List with GSAP Stagger */}
        {loading ? (
          <div className="py-20 text-center text-neutral-500 text-sm">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-neutral-600" />
            Loading infrastructure reports...
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl">
            <p className="text-neutral-400 text-sm font-medium">No complaints match this criteria</p>
            <p className="text-neutral-600 text-xs mt-1">Adjust your filters to display other records</p>
          </div>
        ) : (
          <div ref={listContainerRef} className="space-y-3">
            {complaints.map((item) => {
              const id = item._id || item.id;
              const hasAr = item.measured_via_ar || item.measuredViaAr;
              const photo = item.photo_url || item.image_url || item.photoUrl || item.imageUrl;

              return (
                <div
                  key={id}
                  onClick={() => navigate(`/complaints/${id}`)}
                  className="complaint-row group bg-[#111] hover:bg-[#151515] border border-neutral-800/80 hover:border-neutral-700 transition rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {photo ? (
                        <img
                          src={photo}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MapPin size={20} className="text-neutral-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <SeverityBadge severity={item.severity} />
                        <StatusBadge status={item.status} />
                        {hasAr && (
                          <span className="text-[10px] bg-blue-950/60 border border-blue-900 text-blue-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                            AR Measured
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-white group-hover:text-neutral-100 text-base">
                        {item.title || item.category || 'Infrastructure Issue'}
                      </h3>

                      <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5 max-w-xl">
                        {item.description || 'No additional description provided.'}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-2">
                        <span>{item.address || 'Address unrecorded'}</span>
                        <span>•</span>
                        <span>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString()
                            : 'Recently'}
                        </span>
                        {(item.estimated_area_sqm || item.estimatedAreaSqm) && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-400">
                              {Number(item.estimated_area_sqm || item.estimatedAreaSqm).toFixed(2)} m²
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs text-neutral-500 group-hover:text-neutral-300 transition">
                      View details
                    </span>
                    <ChevronRight size={16} className="text-neutral-500 group-hover:text-white transition" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}