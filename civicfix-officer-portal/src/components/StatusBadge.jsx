import React from 'react';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', color: 'text-neutral-400 bg-neutral-900 border-neutral-800' },
  UNDER_REVIEW: { label: 'Under Review', color: 'text-blue-400 bg-blue-950/40 border-blue-800/60' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60' },
  RESOLVED: { label: 'Resolved', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60' },
  CLOSED: { label: 'Closed', color: 'text-neutral-500 bg-neutral-900/60 border-neutral-800' },
  REJECTED: { label: 'Rejected', color: 'text-rose-400 bg-rose-950/40 border-rose-800/60' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: 'text-neutral-400 bg-neutral-900 border-neutral-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.label}
    </span>
  );
}