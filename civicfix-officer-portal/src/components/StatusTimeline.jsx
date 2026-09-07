import React from 'react';
import { Clock, CheckCircle, ArrowDown } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function StatusTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-xs text-neutral-500 py-4 italic">
        No status transitions recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-neutral-800">
      {history.map((item, index) => {
        const isLatest = index === history.length - 1;
        const formattedTime = item.timestamp || item.created_at
          ? new Date(item.timestamp || item.created_at).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : 'Timestamp missing';

        return (
          <div key={item.id || item._id || index} className="relative flex items-start gap-4 pl-8">
            {/* Timeline Dot */}
            <span
              className={`absolute left-2.5 -translate-x-1/2 mt-1.5 w-3 h-3 rounded-full border-2 ${
                isLatest
                  ? 'bg-white border-neutral-400 ring-4 ring-neutral-900'
                  : 'bg-neutral-900 border-neutral-700'
              }`}
            />

            <div className="flex-1 bg-[#111] border border-neutral-800/80 rounded-xl p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {item.old_status && (
                    <>
                      <StatusBadge status={item.old_status} />
                      <span className="text-neutral-600 text-xs">→</span>
                    </>
                  )}
                  <StatusBadge status={item.new_status || item.status} />
                </div>
                <span className="text-[11px] text-neutral-500">{formattedTime}</span>
              </div>

              {item.comment && (
                <p className="text-xs text-neutral-300 mt-2 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800">
                  {item.comment}
                </p>
              )}

              {item.updated_by && (
                <p className="text-[10px] text-neutral-500 mt-2 font-mono">
                  Updated by: {item.updated_by}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}