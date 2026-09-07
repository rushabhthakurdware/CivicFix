import React from 'react';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

export default function StatCard({ label, count, icon: Icon, colorStyles = {} }) {
  const counterRef = useAnimatedCounter(count);

  return (
    <div
      className={`stat-card bg-[#111] border rounded-2xl p-4 transition-colors ${
        colorStyles.border || 'border-neutral-800/90'
      }`}
    >
      <div
        className={`flex items-center justify-between mb-2 ${
          colorStyles.headerText || 'text-neutral-500'
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={16} />}
      </div>
      <p
        ref={counterRef}
        className={`text-2xl sm:text-3xl font-bold ${
          colorStyles.valueText || 'text-white'
        }`}
      >
        0
      </p>
    </div>
  );
}