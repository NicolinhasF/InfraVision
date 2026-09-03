import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle } from 'lucide-react';
import Navbar from '../../components/navbar';
import './Analises.css';

const TABS = ['Anomalias', 'Padrões', 'Utilização', 'Agrupamentos'];

const ANOMALIAS = [
  {
    servidor: 'SRV-02',
    descricao: 'CPU 38% acima do comportamento esperado',
    nivel: 82,
    corBarra: 'var(--status-critico)',
  },
  {
    servidor: 'SRV-06',
    descricao: 'RAM 43% acima do comportamento esperado',
    nivel: 91,
    corBarra: 'var(--status-critico)',
  },
  {
    servidor: 'SRV-07',
    descricao: 'Uso geral abaixo do esperado',
    nivel: 62,
    corBarra: 'var(--status-atencao)',
  },
];

const RESUMO = [
  { name: 'Anomalias críticas', value: 4, color: 'var(--status-critico)' },
  { name: 'Anomalias médias', value: 6, color: 'var(--status-atencao)' },
  { name: 'Normais', value: 14, color: 'var(--status-normal)' },
];

export default function Analises() {
  const [tab, setTab] = useState('Anomalias');

  return (
    <>
      <Navbar title="Análises" searchPlaceholder={null} />

      <div className="page">
        <div className="analises-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={'analises-tab' + (tab === t ? ' analises-tab-active' : '')}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="analises-row">
          <div className="card analises-list-card">
            {ANOMALIAS.map((a) => (
              <div key={a.servidor} className="analises-item">
                <AlertCircle size={16} className="icon-critico" />
                <div className="analises-item-body">
                  <p className="analises-item-servidor">{a.servidor}</p>
                  <p className="analises-item-desc">{a.descricao}</p>
                  <div className="analises-item-footer">
                    <span>Nível de anomalia</span>
                    <div className="mini-progress-track analises-nivel-track">
                      <div
                        className="mini-progress-fill"
                        style={{ width: `${a.nivel}%`, background: a.corBarra }}
                      />
                    </div>
                    <span className="analises-nivel-valor">{a.nivel}%</span>
                  </div>
                </div>
              </div>
            ))}
            <a className="card-link" href="#/analises">
              Ver relatório completo →
            </a>
          </div>

          <div className="card analises-resumo-card">
            <h2 className="card-title">Resumo</h2>
            <div className="analises-donut-wrap">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={RESUMO}
                    dataKey="value"
                    innerRadius={44}
                    outerRadius={64}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {RESUMO.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="analises-donut-center">
                <span className="analises-donut-total">24</span>
                <span className="analises-donut-total-label">Total</span>
              </div>
            </div>

            <ul className="analises-resumo-list">
              {RESUMO.map((r) => (
                <li key={r.name}>
                  <span className="legend-dot" style={{ background: r.color }} />
                  <span className="analises-resumo-name">{r.name}</span>
                  <span className="analises-resumo-count">
                    {r.value} ({Math.round((r.value / 24) * 100)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
