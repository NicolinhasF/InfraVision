import React from 'react';
import './miniProgress.css';

function corPorValor(valor) {
  if (valor >= 85) return 'var(--status-critico)';
  if (valor >= 65) return 'var(--status-atencao)';
  return 'var(--status-normal)';
}

export default function MiniProgress({ value }) {
  return (
    <div className="mini-progress">
      <div className="mini-progress-track">
        <div
          className="mini-progress-fill"
          style={{ width: `${value}%`, background: corPorValor(value) }}
        />
      </div>
      <span className="mini-progress-label">{value}%</span>
    </div>
  );
}
