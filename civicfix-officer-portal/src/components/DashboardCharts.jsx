import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardCharts({ stats, complaints = [] }) {
  // 1. Severity Distribution
  const doughnutData = {
    labels: ['High / Critical', 'Medium Priority', 'Low Priority'],
    datasets: [
      {
        data: [stats.high || 0, stats.medium || 0, stats.low || 0],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderColor: '#111111',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#a3a3a3',
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { size: 11, family: 'inherit' },
        },
      },
      tooltip: {
        backgroundColor: '#171717',
        titleColor: '#ffffff',
        bodyColor: '#d4d4d4',
        borderColor: '#262626',
        borderWidth: 1,
        padding: 10,
      },
    },
    cutout: '75%',
  };

  // 2. Linear 4-Stage Status Pipeline
  const statusBuckets = {
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
  };

  complaints.forEach((item) => {
    const st = item.status?.toUpperCase();
    if (st && statusBuckets[st] !== undefined) {
      statusBuckets[st] += 1;
    }
  });

  const barData = {
    labels: ['Submitted', 'Under Review', 'In Progress', 'Resolved'],
    datasets: [
      {
        data: [
          statusBuckets.SUBMITTED,
          statusBuckets.UNDER_REVIEW,
          statusBuckets.IN_PROGRESS,
          statusBuckets.RESOLVED,
        ],
        backgroundColor: ['#525252', '#3b82f6', '#eab308', '#10b981'],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#171717',
        titleColor: '#ffffff',
        bodyColor: '#d4d4d4',
        borderColor: '#262626',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#737373', font: { size: 11 } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#1c1c1c' },
        ticks: { color: '#737373', stepSize: 1, font: { size: 11 } },
        border: { display: false },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      <div className="bg-[#111] border border-neutral-800/90 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">
            Severity Ratio
          </h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">Distribution across severity levels</p>
        </div>
        <div className="h-56 relative flex items-center justify-center my-2">
          {stats.total === 0 ? (
            <p className="text-xs text-neutral-600">No telemetry records</p>
          ) : (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          )}
        </div>
      </div>

      <div className="lg:col-span-2 bg-[#111] border border-neutral-800/90 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">
            Resolution Pipeline
          </h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">Complaints along the resolution path</p>
        </div>
        <div className="h-56 mt-3">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}