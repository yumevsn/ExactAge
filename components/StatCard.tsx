
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass = "text-indigo-600" }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center transition-all hover:shadow-md hover:-translate-y-1">
      {icon && <div className={`mb-2 ${colorClass}`}>{icon}</div>}
      <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value.toLocaleString()}</p>
    </div>
  );
};

export default StatCard;
