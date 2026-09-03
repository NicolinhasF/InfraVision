import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Server, Cpu, MemoryStick, Wallet, AlertTriangle, TrendingUp, PiggyBank } from 'lucide-react';
import Navbar from '../../components/navbar';
import StatCard from '../../components/statCard';
import './Home.css';

// ---- dados de exemplo — troque pela sua API ----
const utilizacaoData = [
  { hora: '18:00', cpu: 42, ram: 55 },
  { hora: '20:00', cpu: 38, ram: 58 },
  { hora: '22:00', cpu: 55, ram: 62 },
  { hora: '00:00', cpu: 48, ram: 60 },
  { hora: '02:00', cpu: 60, ram: 66 },
  { hora: '04:00', cpu: 52, ram: 64 },
  { hora: '06:00', cpu: 65, ram: 70 },
  { hora: '08:00', cpu: 58, ram: 68 },
  { hora: '10:00', cpu: 70, ram: 74 },
  { hora: '12:00', cpu: 62, ram: 71 },
  { hora: '14:00', cpu: 56, ram: 64 },
];

const statusData = [
  { name: 'Normal', value: 14, color: 'var(--status-normal)' },
  { name: 'Atenção', value: 6, color: 'var(--status-atencao)' },
  { name: 'Crítico', value: 4, color: 'var(--status-critico)' },
];

const alertas = [
  { servidor: 'SRV-02', descricao: 'CPU acima de 90%', data: 'Hoje, 14:29', nivel: 'critico' },
  { servidor: 'SRV-07', descricao: 'RAM acima de 85%', data: 'Hoje, 13:48', nivel: 'atencao' },
  { servidor: 'SRV-11', descricao: 'Disco acima de 90%', data: 'Hoje, 12:55', nivel: 'critico' },
];

const economiaData = [4, 6, 5, 7, 6, 8, 7, 9];

export default function Home() {
  return (
    <>
      <Navbar title="Dashboard" />

      <div className="page">
        {/* Cards de estatísticas */}
        <div className="stats-row">
          <StatCard
            label="Servidores"
            value="24"
            sublabel="Total monitorado"
            icon={<Server size={18} />}
            iconBg="var(--accent-blue-soft)"
            iconColor="var(--accent-blue)"
          />
          <StatCard
            label="CPU média"
            value="56%"
            sublabel="Utilização atual"
            icon={<Cpu size={18} />}
            iconBg="var(--status-atencao-soft)"
            iconColor="var(--status-atencao)"
          />
          <StatCard
            label="RAM média"
            value="64%"
            sublabel="Utilização atual"
            icon={<MemoryStick size={18} />}
            iconBg="var(--status-roxo-soft)"
            iconColor="var(--status-roxo)"
          />
          <StatCard
            label="Custo mensal"
            value="R$ 8.420"
            sublabel="Custo atual"
            icon={<Wallet size={18} />}
            iconBg="var(--status-normal-soft)"
            iconColor="var(--status-normal)"
          />
        </div>

        {/* Gráfico de utilização + status dos servidores */}
        <div className="row-2col">
          <div className="card">
            <h2 className="card-title">Utilização da infraestrutura (últimas 24h)</h2>
            <div className="dash-legend">
              <span className="legend-dot" style={{ background: 'var(--chart-cpu)' }} /> CPU
              <span className="legend-dot" style={{ background: 'var(--chart-ram)', marginLeft: 16 }} /> RAM
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={utilizacaoData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Line type="monotone" dataKey="cpu" stroke="var(--chart-cpu)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ram" stroke="var(--chart-ram)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="card-title">Status dos servidores</h2>
            <div className="dash-donut-wrap">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    innerRadius={48}
                    outerRadius={68}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="dash-donut-center">
                <span className="dash-donut-total">24</span>
                <span className="dash-donut-total-label">Total</span>
              </div>

              <ul className="dash-status-list">
                {statusData.map((s) => (
                  <li key={s.name}>
                    <span className="legend-dot" style={{ background: s.color }} />
                    <span className="dash-status-name">{s.name}</span>
                    <span className="dash-status-count">
                      {s.value} ({Math.round((s.value / 24) * 100)}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Alertas / Economia potencial / Previsões */}
        <div className="row-3col">
          <div className="card">
            <h2 className="card-title">Alertas recentes</h2>
            <ul className="dash-alert-list">
              {alertas.map((a) => (
                <li key={a.servidor + a.descricao}>
                  <AlertTriangle
                    size={14}
                    className={a.nivel === 'critico' ? 'icon-critico' : 'icon-atencao'}
                  />
                  <div className="dash-alert-text">
                    <span className="dash-alert-title">
                      {a.servidor} · {a.descricao}
                    </span>
                    <span className="dash-alert-date">{a.data}</span>
                  </div>
                </li>
              ))}
            </ul>
            <a className="card-link" href="#/servidores">
              Ver todos →
            </a>
          </div>

          <div className="card">
            <h2 className="card-title">Economia potencial</h2>
            <p className="dash-economia-value">
              R$ 1.280 <span>/mês</span>
            </p>
            <p className="dash-economia-sub">Com as otimizações recomendadas</p>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={economiaData.map((v, i) => ({ i, v }))}>
                <Line type="monotone" dataKey="v" stroke="var(--status-normal)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="card-title">Previsões importantes</h2>
            <div className="dash-prev-item">
              <TrendingUp size={16} className="icon-critico" />
              <div>
                <p className="dash-prev-server">SRV-02</p>
                <p className="dash-prev-desc">Risco de saturação de disco</p>
                <p className="dash-prev-meta">3 horas · Probabilidade: 87%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
