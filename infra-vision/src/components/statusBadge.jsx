import React from 'react';

const CLASS_BY_STATUS = {
  Normal: 'status-badge-normal',
  Atenção: 'status-badge-atencao',
  Crítico: 'status-badge-critico',
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge ${CLASS_BY_STATUS[status] || ''}`}>{status}</span>;
}
