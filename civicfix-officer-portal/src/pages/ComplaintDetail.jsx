import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Layers,
  Ruler,
  AlertCircle,
  Lock,
  Send,
  ExternalLink,
} from 'lucide-react';
import { complaintApi } from '../api/complaintApi';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import StatusTimeline from '../components/StatusTimeline';
import DetailMiniMap from '../components/DetailMiniMap';
import toast from 'react-hot-toast';

// Strict 4-step forward pipeline (No REJECTED or CLOSED)
const NEXT_STATUS_MAP = {
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: [], // Terminal final state
};

// Normalize casing, spaces, or hyphens (e.g. "Under Review" -> "UNDER_REVIEW")
const normalizeStatusKey = (status) => {
  if (!status) return 'SUBMITTED';
  return String(status).trim().toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_');
};

const formatStatusLabel = (status) => {
  const map = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
  };
  return map[status] || status.replace(/_/g, ' ');
};

export default function ComplaintDetail() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  // Status transition form states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // 1. Unified property resolution
  const currentStatus = normalizeStatusKey(complaint?.status);
  const nextAllowed = NEXT_STATUS_MAP[currentStatus] || [];

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      setImageFailed(false);

      const [detailRes, historyRes] = await Promise.all([
        complaintApi.getComplaintDetail(id),
        complaintApi.getStatusHistory(id),
      ]);

      // Deep unpack payload structure
      const raw = detailRes.data;
      const record =
        raw?.complaint ||
        raw?.data?.complaint ||
        raw?.data ||
        raw?.result ||
        raw;

      setComplaint(record);

      // Deep unpack status history list
      const rawHistory = historyRes.data;
      const historyList = Array.isArray(rawHistory)
        ? rawHistory
        : rawHistory?.history ||
          rawHistory?.data?.history ||
          rawHistory?.data ||
          [];
      setHistory(historyList);

      // Explicitly set default next step
      const normStatus = normalizeStatusKey(record?.status);
      const nextSteps = NEXT_STATUS_MAP[normStatus] || [];
      setSelectedStatus(nextSteps[0] || '');
    } catch (err) {
      console.error('Failed to load complaint data:', err);
      setError('Unable to load complaint details. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Keep selectedStatus in sync whenever complaint data changes
  useEffect(() => {
    if (nextAllowed.length > 0 && !selectedStatus) {
      setSelectedStatus(nextAllowed[0]);
    }
  }, [currentStatus]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setActionError('');

    // Ensure status is never undefined
    const statusToSend = selectedStatus || nextAllowed[0];

    if (!statusToSend) {
      setActionError('No valid next status found for this report.');
      return;
    }

    if (statusToSend === 'RESOLVED' && !comment.trim()) {
      const msg = 'A completion comment is required when marking as RESOLVED.';
      setActionError(msg);
      toast.error(msg);
      return;
    }

    try {
      setSubmitting(true);
      await complaintApi.updateStatus(id, statusToSend, comment);
      setComment('');
      toast.success(`Report status updated to ${formatStatusLabel(statusToSend)}`);
      await loadData();
    } catch (err) {
      console.error('Status update failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update status.';
      setActionError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-sm text-neutral-400">
        Fetching report telemetry...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link to="/dashboard" className="text-xs text-neutral-400 hover:text-white flex items-center gap-1">
            <ArrowLeft size={14} /> Return to Queue
          </Link>
          <div className="p-4 bg-red-950/40 border border-red-900 rounded-xl text-red-300 text-sm">
            {error || 'Record not found.'}
          </div>
        </div>
      </div>
    );
  }

  const complaintId = complaint._id || complaint.id || id;
  const photoUrl =
    complaint.photo_url ||
    complaint.photoUrl ||
    complaint.image_url ||
    complaint.imageUrl ||
    complaint.image ||
    complaint.photo ||
    complaint.snapshot_url ||
    complaint.snapshotUrl;

  const hasAr = Boolean(
    complaint.measured_via_ar ||
    complaint.measuredViaAr ||
    complaint.estimated_area_sqm ||
    complaint.estimatedAreaSqm
  );

  const area = complaint.estimated_area_sqm ?? complaint.estimatedAreaSqm;
  const length = complaint.estimated_length_m ?? complaint.estimatedLengthM;
  const width = complaint.estimated_width_m ?? complaint.estimatedWidthM;

  const latitude =
    complaint.latitude ??
    complaint.lat ??
    (complaint.location?.coordinates ? complaint.location.coordinates[1] : null);

  const longitude =
    complaint.longitude ??
    complaint.lng ??
    (complaint.location?.coordinates ? complaint.location.coordinates[0] : null);

  const hasValidCoords = latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans select-none pb-16">
      {/* Header bar */}
      <div className="border-b border-neutral-800 bg-[#0a0a0a] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/dashboard"
            className="text-xs font-medium text-neutral-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft size={15} /> Back to dashboard
          </Link>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={complaint.severity} />
            <StatusBadge status={currentStatus} />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Title & Metadata */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-neutral-500 uppercase tracking-widest font-mono mb-1">
            <span>ID: {complaintId}</span>
            <span>•</span>
            <span>Category: {complaint.category || 'General'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            {complaint.title || complaint.category || 'Infrastructure Defect'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Media & Specifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Evidence / Photo */}
            <div className="bg-[#111] border border-neutral-800/80 rounded-2xl overflow-hidden">
              <div className="h-80 sm:h-96 w-full bg-[#080808] flex items-center justify-center relative">
                {photoUrl && !imageFailed ? (
                  <img
                    src={photoUrl}
                    alt="Defect visual evidence"
                    onError={() => setImageFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-neutral-600 flex flex-col items-center select-none">
                    <MapPin size={32} className="stroke-1" />
                    <span className="text-xs mt-2">
                      {imageFailed ? 'Image asset failed to load' : 'No photo submitted with report'}
                    </span>
                  </div>
                )}

                {hasAr && (
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur border border-neutral-700 px-3 py-1 rounded-lg text-xs font-medium text-neutral-200 flex items-center gap-1.5 shadow-md">
                    <Layers size={14} className="text-blue-400" />
                    AR Scan Verified
                  </div>
                )}
              </div>

              {/* Citizen Description */}
              <div className="p-5 border-t border-neutral-800">
                <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-2">
                  Citizen Description
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {complaint.description || 'No detailed description submitted.'}
                </p>
              </div>
            </div>

            {/* AR Spatial Telemetry */}
            <div className="bg-[#111] border border-neutral-800/80 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider flex items-center gap-2">
                  <Ruler size={15} /> AR Spatial Measurements
                </h3>
                {!hasAr && (
                  <span className="text-xs text-neutral-500 italic">Not measured via AR</span>
                )}
              </div>

              {hasAr ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-3">
                    <p className="text-[11px] text-neutral-500 uppercase">Estimated Area</p>
                    <p className="text-lg font-bold text-white mt-1">
                      {area !== undefined && area !== null ? `${Number(area).toFixed(2)} m²` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-3">
                    <p className="text-[11px] text-neutral-500 uppercase">Length</p>
                    <p className="text-lg font-bold text-white mt-1">
                      {length !== undefined && length !== null ? `${Number(length).toFixed(2)} m` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-3">
                    <p className="text-[11px] text-neutral-500 uppercase">Width</p>
                    <p className="text-lg font-bold text-white mt-1">
                      {width !== undefined && width !== null ? `${Number(width).toFixed(2)} m` : 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500">
                  This report was submitted without an augmented reality mesh scan. Severity was computed via category and NLP scoring.
                </p>
              )}
            </div>

            {/* Geospatial Coordinates with Mini-Map */}
            <div className="bg-[#111] border border-neutral-800/80 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider flex items-center gap-2">
                  <MapPin size={15} /> Geospatial Coordinates
                </h3>
                {hasValidCoords && (
                  <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <p className="text-sm text-neutral-200">
                {complaint.address || 'Address not resolved'}
              </p>

              {hasValidCoords ? (
                <DetailMiniMap
                  lat={latitude}
                  lng={longitude}
                  severity={complaint.severity}
                />
              ) : (
                <div className="mt-3 p-4 border border-dashed border-neutral-800 rounded-xl text-center text-neutral-600 text-xs">
                  GPS coordinates were not attached to this submission.
                </div>
              )}

              <div className="mt-3 flex gap-6 text-xs font-mono text-neutral-500 bg-[#0a0a0a] p-3 rounded-xl border border-neutral-800/80">
                <span>Lat: {hasValidCoords ? Number(latitude).toFixed(6) : 'N/A'}</span>
                <span>Lng: {hasValidCoords ? Number(longitude).toFixed(6) : 'N/A'}</span>
              </div>
            </div>

            {/* Budget Panel (Blocked Indicator) */}
            <div className="bg-[#111] border border-dashed border-neutral-800 rounded-2xl p-5 opacity-75">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider flex items-center gap-2">
                  <Lock size={14} className="text-neutral-500" /> Budget Allocation
                </h3>
                <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-500 px-2 py-0.5 rounded">
                  Pending Schema Migration
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Budget tracking features will unlock once the backend table and endpoints are finalized.
              </p>
            </div>
          </div>

          {/* Right Column: Workflow Actions & Timeline */}
          <div className="space-y-6">
            {/* Status Update Control */}
            <div className="bg-[#111] border border-neutral-800/80 rounded-2xl p-5">
              <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-4">
                Update Status
              </h3>

              {nextAllowed.length === 0 ? (
                <p className="text-xs text-neutral-500">
                  This report has reached its terminal state ({formatStatusLabel(currentStatus)}). No further transitions allowed.
                </p>
              ) : (
                <form onSubmit={handleStatusUpdate} className="space-y-4">
                  {actionError && (
                    <div className="p-2.5 bg-red-950/40 border border-red-900 text-red-300 rounded-lg text-xs">
                      {actionError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5">Select Next Step</label>
                    <select
                      value={selectedStatus || nextAllowed[0] || ''}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-neutral-500 cursor-pointer"
                    >
                      {nextAllowed.map((st) => (
                        <option key={st} value={st}>
                          Advance to: {formatStatusLabel(st)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5">
                      Officer Comment {selectedStatus === 'RESOLVED' && <span className="text-red-400">*</span>}
                    </label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={
                        selectedStatus === 'RESOLVED'
                          ? 'Explain actions taken to resolve (Mandatory)...'
                          : 'Optional notes for timeline audit...'
                      }
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-neutral-200 hover:bg-white text-black text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    <Send size={13} />
                    {submitting ? 'Applying Transition...' : 'Update Status'}
                  </button>
                </form>
              )}
            </div>

            {/* Audit History Timeline */}
            <div className="bg-[#111] border border-neutral-800/80 rounded-2xl p-5">
              <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-4 flex items-center gap-2">
                <Calendar size={14} /> Status History
              </h3>
              <StatusTimeline history={history} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}