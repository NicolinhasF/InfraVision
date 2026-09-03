import React from 'react';
import './statCard.css';

export default function StatCard({ icon, label, value, sublabel, iconBg, iconColor }) {
  return (
    <div className="stat-card">
      <div>
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
        {sublabel && <p className="stat-card-sublabel">{sublabel}</p>}
      </div>
      <div className="stat-card-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
    </div>
  );
}
