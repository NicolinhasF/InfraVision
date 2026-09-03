import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Navbar from '../../components/navbar';
import './Previsoes.css';

const SERVIDORES = ['SRV-02', 'SRV-06', 'SRV-04', 'SRV-08'];

const HISTORICO_PREVISAO = [
  { hora: '08:00', valor: 55, tipo: 'historico' },
  { hora: '10:00', valor: 60, tipo: 'historico' },
  { hora: '12:00', valor: 68, tipo: 'historico' },
  { hora: '14:00', valor: 74, tipo: 'historico' },
  { hora: '16:00', valor: 80, tipo: 'historico' },
  { hora: '18:00', valor: 87, tipo: 'previsao' },
  { hora: '20:00', valor: 93, tipo: 'previsao' },
];

const PREVISOES_CARDS = [
  { titulo: 'Previsão de RAM', risco: 'Risco de saturação', valor: '72%', tag: 'Alta (88%)' },
  { titulo: 'Previsão de Disco', risco: 'Tempo estimado', valor: '34%', tag: '12 horas' },
  { titulo: 'Previsão de Rede', risco: 'Risco de saturação', valor: '45%', tag: 'Baixa' },
];

export default function Previsoes() {
  const [servidor, setServidor] = useState('SRV-02');

  return (
    <>
      <Navbar title="Previsões" searchPlaceholder={null} />

      <div className="page">
        <div className="card">
          <div className="prev-header">
            <div>
              <h2 className="card-title">Selecionar servidor</h2>
              <select
                className="filter-select"
                value={servidor}
                onChange={(e) => setServidor(e.target.value)}
              >
                {SERVIDORES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="prev-legend">
            <span className="legend-dot" style={{ background: 'var(--text-secondary)' }} /> Histórico
            <span className="legend-dot" style={{ background: 'var(--accent-blue)', marginLeft: 16 }} /> Previsão
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={HISTORICO_PREVISAO} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border-color-soft)" vertical={false} />
              <XAxis dataKey="hora" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="var(--accent-blue)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="prev-summary">
            <div className="prev-summary-value">87%</div>
            <div>
              <p className="prev-summary-label">Previsão de CPU</p>
              <p className="prev-summary-sub">Próximas 6 horas</p>
            </div>
            <div className="prev-summary-time">
              <p className="prev-summary-label">Tempo estimado</p>
              <p className="prev-summary-sub">3 horas</p>
            </div>
            <div>
              <p className="prev-summary-label">Confiança do modelo</p>
              <span className="status-badge status-badge-atencao">Alta (88%)</span>
            </div>
          </div>
        </div>

        <div className="prev-cards-row">
          {PREVISOES_CARDS.map((p) => (
            <div key={p.titulo} className="card prev-mini-card">
              <h3 className="card-title">{p.titulo}</h3>
              <p className="prev-mini-risco">{p.risco}</p>
              <div className="prev-mini-footer">
                <span className="prev-mini-valor">{p.valor}</span>
                <span className="status-badge status-badge-normal">{p.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
