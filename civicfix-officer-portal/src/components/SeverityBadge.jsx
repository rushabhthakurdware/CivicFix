import React from 'react';

const SEVERITY_STYLES = {
  HIGH: 'bg-red-950/60 text-red-400 border-red-800/80',
  MEDIUM: 'bg-amber-950/60 text-amber-400 border-amber-800/80',
  LOW: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80',
};

export default function SeverityBadge({ severity }) {
  const norm = severity ? severity.toUpperCase() : 'LOW';
  const style = SEVERITY_STYLES[norm] || 'bg-neutral-900 text-neutral-400 border-neutral-800';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase border ${style}`}
    >
      {norm}
    </span>
  );
}